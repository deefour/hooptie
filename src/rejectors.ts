import {
  AUTOLIST,
  AUTOTRADER,
  MAX_MILES_WORTH_DRIVING_FOR_PICKUP,
  MILE_AS_METERS
} from "./constants";
import { Listing, ListingRejector, Vehicle } from "./types";

import store from "./store";

export const TRASHED = "trashed";
export const TOO_FAR = "too-far-to-drive";

export const trashed: ListingRejector = {
  id: TRASHED,
  name: "Trashed",
  description: "Listings that have been previously dismissed",
  filter: (listing: Listing) => store.getters.isTrashed(listing)
};

export const autotrader: ListingRejector = {
  id: AUTOTRADER,
  name: "AutoTrader",
  description: "Listings originating from AutoTrader.com",
  filter: (listing: Listing): boolean =>
    listing.service.toLowerCase() === AUTOTRADER
};

export const autolist: ListingRejector = {
  id: AUTOLIST,
  name: "Autolist",
  description: "Listings originating from Autolist.com",
  filter: (listing: Listing): boolean =>
    listing.service.toLowerCase() === AUTOLIST
};

export const tooFar: ListingRejector = {
  id: TOO_FAR,
  name: "Requires Flight or Delivery",
  description: `Listings over ${MAX_MILES_WORTH_DRIVING_FOR_PICKUP} miles away, realistically requiring delivery or a flight`,
  filter: (listing: Listing): boolean => {
    if (listing?.distance === undefined) {
      // yes, match vehicles with an unknown distance - it means we have no idea where they are!
      return true;
    }

    return (
      listing.distance > MAX_MILES_WORTH_DRIVING_FOR_PICKUP * MILE_AS_METERS
    );
  }
};

/**
 * Create a ListingRejector for the passed vehicle. When active, this will omit
 * vehicles matching the `identifier` from display.
 *
 * @param {Vehicle} vehicle the vehicle search description to create a listing rejector for
 */
export const createRejectorForVehicle = (
  vehicle: Vehicle
): ListingRejector => ({
  id: `vehicle--${vehicle.identifier}`,
  name: vehicle.title,
  description: `Listings for the '${vehicle.description}' vehicle search`,
  filter: (listing: Listing): boolean =>
    listing.search_identifier === vehicle.identifier
});

/**
 * The default listing of rejectors to use.
 */
export default [trashed, autotrader, autolist, tooFar];
