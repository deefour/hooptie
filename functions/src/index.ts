import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

admin.initializeApp();

/**
 * Listening for any document in the 'listings' collection to newly be created,
 * use Google's geocoder and diststancematrix APIs to get location information
 * for a listing if a zip code is available.
 *
 * Distance calculations are based on the 'settings/location' origin location.
 */
export const setLocationOnListingIfMissing = functions.firestore
  .document("listings/{vin}")
  .onCreate(require("./functions/setLocationOnListingIfMissing").default);

/**
 * At 5AM and 4PM Eastern Time, fetch the latest search results from supported
 * listing services, creating and updating documents in the 'listings' collection
 * in Cloud Firestore.
 */
export const syncListings = functions.pubsub
  .schedule("0 5,16 * * *")
  .timeZone("America/New_York")
  .onRun(require("./functions/syncListings").default);

/**
 * When a user record is created or updated, make sure all the push tokens on file
 * for them are subscribed to the 'New Listings' topic.
 */
export const subscribeUserPushTokensToNewListingsTopic = functions.firestore
  .document("users/{uid}")
  .onWrite(
    require("./functions/subscribeUserPushTokensToNewListingsTopic").default
  );
