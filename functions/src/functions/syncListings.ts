import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { flatten } from "lodash";
import pAll from "p-all";

import { MakeService as autolist } from "../autolist";
import { MakeService as autotrader } from "../autotrader";
import { REQUEST_CONCURRENCY } from "../constants";
import Listing, { duplicateListingReducer } from "../Listing";
import { getLocation } from "../Location";
import { makeSearchServices } from "../SearchService";
import { DeferredGetListings, SearchService } from "../types";
import { getVehicles } from "../Vehicle";

export default async (context: functions.EventContext): Promise<void> => {
  console.info("Fetching location and vehicles from firestore...");
  const [location, vehicles] = await Promise.all([
    getLocation(),
    getVehicles()
  ]);

  console.info("Creating search service instances...");
  const searchServices: Map<string, SearchService> = makeSearchServices(
    [autotrader, autolist],
    location
  );

  console.info("Begin vehicle searches against all services.");
  const listings: Map<string, Listing> = new Map();

  // create an array of methods that are each responsible for *creating* a search
  // against a listing service for a vehicle. These tiny functions defer the
  // initialization of
  const deferredListingPromises: DeferredGetListings[] = Array.from(
    searchServices.values()
  ).reduce(
    (acc: DeferredGetListings[], service: SearchService) =>
      acc.concat(service.deferredGetListingsForAll(vehicles)),
    []
  );

  try {
    // wait on all searches to complete. flatten out to a single array of Listings.
    const searchResults: Listing[][] = await pAll(deferredListingPromises, {
      concurrency: REQUEST_CONCURRENCY
    });

    console.info(
      "de-dupe the listings by VIN, considering a 'priority' given to each service"
    );
    flatten(searchResults).reduce(
      duplicateListingReducer(searchServices),
      listings
    );
  } catch (error) {
    console.error(error);
    return;
  }

  console.info(`Queue writes for [${listings.size}] listings to firestore`);
  const batch = admin.firestore().batch();

  try {
    const asyncOperations = Array.from(listings.values()).map<Promise<void>>(
      async listing => {
        const doc = admin.firestore().doc(`listings/${listing.vin}`);
        const snapshot = await doc.get();

        if (snapshot.exists) {
          console.info(
            `Updating listing for vin [${
              listing.vin
            }] (${listing.title()}) from [${listing.service}]`
          );
          batch.update(doc, {
            ...listing.toDocumentData(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });

          return;
        }

        console.info(
          `Creating new listing for vin [${
            listing.vin
          }] (${listing.title()}) from [${listing.service}]`
        );
        batch.set(doc, {
          ...listing.toDocumentData(),
          created_at: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    );

    await Promise.all(asyncOperations);
  } catch (error) {
    console.error(error);
    return;
  }

  try {
    console.info("Write everything to firestore.");
    await batch.commit();
    console.log("Write success. Listings have been updated");
  } catch (error) {
    console.error(error);
  }
};
