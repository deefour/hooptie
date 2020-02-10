import * as autolist from "./autolist";
import * as autotrader from "./autotrader";
import * as functions from "firebase-functions";

import { flatten, uniqBy } from "lodash";

import Listing from "./Listing";
import Location from "./Location";
import { SearchService } from "./types";
import Vehicle from "./Vehicle";
import admin from "firebase-admin";

admin.initializepp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

(async () => {
  const location = new Location();
  const vehicles: Vehicle[] = [];
  const services = [
    autotrader.MakeService(location),
    autolist.MakeService(location)
  ].reduce(
    (acc, service) => acc.set(service.identifier, service),
    new Map<string, SearchService>()
  );

  const listingPromises: Promise<Listing[]>[] = services.reduce<
    Promise<Listing[]>[]
  >(
    (acc, service) =>
      acc.concat(vehicles.map(vehicle => service.getListings(vehicle))),
    []
  );

  const listings = flatten(await Promise.all(listingPromises)).reduce(
    (acc, listing) => {
      if (!acc.has(listing.vin)) {
        acc.set(listing.vin, listing);
      }

      const a = services.get(listing.service);
      const b = services.get((acc.get(listing.vin) as Listing).service);

      if (a && b && a.priority > b.priority) {
        acc.set(listing.vin, listing);
      }

      return acc;
    },
    new Map<string, Listing>()
  );
})();
