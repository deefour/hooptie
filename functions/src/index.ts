import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import setLocationIfMissing from "./functions/setLocationIfMissing";
import syncListings from "./functions/syncListings";

admin.initializeApp();

/**
 * Listening for any document in the 'listings' collection to newly be created,
 * use Google's geocoder and diststancematrix APIs to get location information
 * for a listing if a zip code is available.
 *
 * Distance calculations are based on the 'settings/location' origin location.
 */
export const setLocationOnListing = functions.firestore
  .document("listings/{vin}")
  .onCreate(setLocationIfMissing);

/**
 * At 5AM and 4PM Eastern Time, fetch the latest search results from supported
 * listing services, creating and updating documents in the 'listings' collection
 * in Cloud Firestore.
 */
export const updateListings = functions.pubsub
  .schedule("0 5,16 * * *")
  .timeZone("America/New_York")
  .onRun(syncListings);
