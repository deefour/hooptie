import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import { flatten } from 'lodash';

import * as autolist from './autolist';
import * as autotrader from './autotrader';
import Listing from './Listing';
import Location, { getLocation } from './Location';
import { SearchService } from './types';
import Vehicle, { getVehicles } from './Vehicle';

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const updateListings = functions.f(async () => {
  const [location, vehicles] = await Promise.all([
    getLocation(),
    getVehicles()
  ]);

  const services = [
    autotrader.MakeService(location),
    autolist.MakeService(location)
  ].reduce(
    (acc, service) => acc.set(service.identifier, service),
    new Map<string, SearchService>()
  );

  const listingPromises: Promise<Listing[]>[] = [...services.values()].reduce(
    (acc: Promise<Listing[]>[], service: SearchService) =>
      acc.concat(vehicles.map(vehicle => service.getListings(vehicle))),
    []
  );

  const listings = flatten(await Promise.all(listingPromises)).reduce(
    (acc: Map<string, Listing>, listing: Listing) => {
      if (!acc.has(listing.vin)) {
        // if a listing for the VIN doesn't exist in the map, set it!
        acc.set(listing.vin, listing);
      }

      const a = services.get(listing.service);
      const b = services.get((acc.get(listing.vin) as Listing).service);

      if (a && b && a.priority > b.priority) {
        // if the incoming listing's service priority is greater than the one currently
        // in the map, replace it!
        acc.set(listing.vin, listing);
      }

      return acc;
    },
    new Map<string, Listing>()
  );

  const batch = admin.firestore().batch();

  try {
    listings.forEach(async listing => {
      const doc = admin.firestore().doc(`listings/${listing.vin}`);

      if ((await doc.get()).exists) {
        batch.update(doc, {
          ...listing.toJSON(),
          updated_at: admin.firestore.FieldValue.serverTimestamp()
        });
        return;
      }

      batch.set(doc, {
        ...listing.toJSON(),
        created_at: admin.firestore.FieldValue.serverTimestamp()
      });
    });

    await batch.commit();
  } catch (error) {
    throw error;
  }
})();
