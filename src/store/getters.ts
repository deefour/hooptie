import { Decision, Listing, ListingRejector, RootState } from "~/types";
import { difference, reject } from "lodash";
import rejectors, { createRejectorForVehicle } from "~/rejectors";

import { GetterTree } from "vuex";

export const getters: GetterTree<RootState, RootState> = {
  isAuthenticated: (_: RootState, getters) => !getters.isAnonymous,
  isAnonymous: state => state.user === undefined,
  hasListings: state => state.listings.length > 0,
  isFavorited: state => (listing: Listing): boolean =>
    state.favorited.some((f: Decision) => f.vin === listing.vin),
  isTrashed: state => (listing: Listing): boolean =>
    state.trashed.some((f: Decision) => f.vin === listing.vin),
  isActive: state => (listing: Listing): boolean =>
    state.active === listing.vin,
  allListingsHaveBeenReviewed: state => {
    const vins = (docs: { vin: string }[]): string[] =>
      docs.map(doc => doc.vin);

    return (
      difference(
        difference(vins(state.listings), vins(state.favorited)),
        vins(state.trashed)
      ).length === 0
    );
  },
  rejectors: (state): ListingRejector[] => {
    const allRejectors: ListingRejector[] = [...rejectors];

    // now build rejectors for each vehicle
    allRejectors.push(...state.vehicles.map(createRejectorForVehicle));

    return allRejectors;
  },

  activeRejectors: (state, getters): ListingRejector[] =>
    getters.rejectors.filter((rejector: ListingRejector) =>
      state.rejectors.includes(rejector.id)
    ),

  filteredListings: (state, getters): Listing[] =>
    getters.activeRejectors.reduce(
      (listings: Listing[], rejector: ListingRejector) =>
        reject(listings, rejector.filter),
      state.listings
    )
};

export default getters;
