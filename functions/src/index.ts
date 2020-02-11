import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

import Listing, { duplicateListingReducer } from "./Listing";

import { SearchService } from "./types";
import { MakeService as autolist } from "./autolist";
import { MakeService as autotrader } from "./autotrader";
import { flatten } from "lodash";
import { getLocation } from "./Location";
import { getVehicles } from "./Vehicle";
import { makeSearchServices } from "./SearchService";

admin.initializeApp({
  credential: admin.credential.cert(require("../../firebase.server.js")),
  databaseURL: require("../../firebase.client.js").databaseURL
});

export const updateListings = functions.https.onRequest(async (req, res) => {
  // fetch vehicle and location data from Cloud Firestore
  const [location, vehicles] = await Promise.all([
    getLocation(),
    getVehicles()
  ]);

  // init a Map of search services
  const searchServices: Map<string, SearchService> = makeSearchServices(
    [autotrader, autolist],
    location
  );

  // build up an array of promises that each represent a vehicle search
  const listingPromises: Promise<Listing[]>[] = [
    ...searchServices.values()
  ].reduce(
    (acc: Promise<Listing[]>[], service: SearchService) =>
      acc.concat(service.getListingsForAll(vehicles)),
    []
  );

  // run the searches, dedupe via Map, and then convert the result back into an
  // array of listings
  const listings: Map<string, Listing> = new Map();

  try {
    flatten(await Promise.all(listingPromises)).reduce(
      duplicateListingReducer(searchServices),
      listings
    );
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch new listings.");
  }

  // set up for a batch write against firestore
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
          // update the existing document with the lastest listing info
          batch.update(doc, {
            ...listing.toDocumentData(),
            updated_at: admin.firestore.FieldValue.serverTimestamp()
          });

          return;
        }

        // create a new document for the listing
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
    // perform the batch write
    await batch.commit();

    res.status(200).send("Done!");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to apply batch write.");
  }
});
