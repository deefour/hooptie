import { AUTOLIST, AUTOTRADER, MILE_AS_METERS } from "./constants";
import store from "./store";
import { Listing, ListingRejector } from "./types";

export const TRASHED = "trashed";
export const TOO_FAR = "too-far-to-drive";

const trashed: ListingRejector = {
  id: TRASHED,
  name: "Trashed",
  description: "listings that have been previously dismissed",
  filter: (listing: Listing) => store.getters.isTrashed(listing)
};

const autotrader: ListingRejector = {
  id: AUTOTRADER,
  name: "AutoTrader",
  description: "listings originating on the AutoTrader.com site",
  filter: (listing: Listing): boolean =>
    listing.service.toLowerCase() === AUTOTRADER
};

const autolist: ListingRejector = {
  id: AUTOLIST,
  name: "AutoList",
  description: "listings originating on the Autolist.com site",
  filter: (listing: Listing): boolean =>
    listing.service.toLowerCase() === AUTOLIST
};

const tooFar: ListingRejector = {
  id: TOO_FAR,
  name: "Requires Flight or Delivery",
  description: "listings that would realistically require delivery or a flight",
  filter: (listing: Listing): boolean => {
    if (listing?.distance === undefined) {
      // yes, match vehicles with an unknown distance - it means we have no idea where they are!
      return true;
    }

    return listing.distance > 500 * MILE_AS_METERS;
  }
};

export default [trashed, autotrader, autolist, tooFar];
