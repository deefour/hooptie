import { GetterTree } from "vuex";
import { Decision, Listing, RootState } from "~/types";

export const getters: GetterTree<RootState, RootState> = {
  isAuthenticated: (_: RootState, getters) => !getters.isAnonymous,
  isAnonymous: state => state.user === undefined,
  hasListings: state => state.listings.length > 0,
  isFavorited: state => (listing: Listing): boolean =>
    state.favorited.some((f: Decision) => f.vin === listing.vin),
  isTrashed: state => (listing: Listing): boolean =>
    state.trashed.some((f: Decision) => f.vin === listing.vin),
  isActive: state => (listing: Listing): boolean => state.active === listing.vin
};

export default getters;
