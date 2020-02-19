import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import { DeferredGetListings, SearchService } from "../types";
import Listing, { duplicateListingReducer } from "../Listing";
import { REQUEST_CONCURRENCY, TOPIC_NEW_LISTINGS } from "../constants";

import { MakeService as autolist } from "../autolist";
import { MakeService as autotrader } from "../autotrader";
import { flatten } from "lodash";
import { getLocation } from "../Location";
import { getVehicles } from "../Vehicle";
import { makeSearchServices } from "../SearchService";
import pAll from "p-all";

/**
 * When 1+ listings have been newly created, send an FCM notification to the
 * 'New Listings' topic stating new listings are available.
 *
 * @param {Number} newListingsCount
 */
const sendNewListingsNotification = async (
  newListingsCount: number
): Promise<void> => {
  if (newListingsCount < 1) {
    return;
  }

  let body = "There is 1 new listing to review.";

  if (newListingsCount !== 1) {
    body = `There are ${newListingsCount} new listings to review.`;
  }

  const payload = {
    notification: {
      title: "New Listings Available!",
      body,
      click_action: functions.config().app.url
    }
  };

  try {
    const response = await admin
      .messaging()
      .sendToTopic(TOPIC_NEW_LISTINGS, payload);

    console.info("Notification sent", response);
  } catch (error) {
    console.info("Notification failed");
    console.error(error);
  }
};

export default async (): Promise<void> => {
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
  let newListingsCount = 0;

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

        newListingsCount++;
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
    await sendNewListingsNotification(newListingsCount);
    console.log("Write success. Listings have been updated");
  } catch (error) {
    console.error(error);
  }
};
