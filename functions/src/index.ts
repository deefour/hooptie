import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { DeferredGetListings, SearchService } from "./types";
import Listing, { duplicateListingReducer } from "./Listing";

import { REQUEST_CONCURRENCY } from "./constants";
import { MakeService as autolist } from "./autolist";
import { MakeService as autotrader } from "./autotrader";
import { flatten } from "lodash";
import { getLocation } from "./Location";
import { getVehicles } from "./Vehicle";
import { makeSearchServices } from "./SearchService";
import pAll from "p-all";

admin.initializeApp({
  credential: admin.credential.cert(require("../../firebase.server.js")),
  databaseURL: require("../../firebase.client.js").databaseURL
});

export const updateListings = functions.https.onRequest(async (req, res) => {
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
    res.status(500).send("Failed to fetch new listings.");
  }

  console.info(`Queue writes for [${listings.size}] listings to firestore`);
  const batch = admin.firestore().batch();

  try {
    const asyncOperations = Array.from(listings.values()).map<Promise<void>>(
      async listing => {
        const doc = admin.firestore().doc(`listings/${listing.vin}`);
        let snapshot;

        try {
          snapshot = await doc.get();
        } catch (error) {
          throw error;
        }

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
    res.status(500).send("Failed to build batch write.");
  }

  try {
    console.info("Write everything to firestore.");
    await batch.commit();

    res.status(200).send("Done!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to apply batch write.");
  }
});
