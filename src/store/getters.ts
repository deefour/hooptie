import { Decision, Listing, RootState } from "~/types";

import { GetterTree } from "vuex";
import { difference } from "lodash";

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
    const vins = state.listings.map(l => l.vin);

    return (
      difference(difference(vins, state.favorited), state.trashed).length === 0
    );
  }
};

export default getters;
