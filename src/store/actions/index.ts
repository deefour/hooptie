import { ActionTree } from "vuex";
import { Listing, RootState } from "~/types";

import { QUERY_LIMIT } from "../../constants";
import { firestore } from "../../firebase";
import auth from "./auth";
import decisions from "./decisions";

const actions: ActionTree<RootState, RootState> = {
  ...auth,
  ...decisions,

  /**
   * Load all data needed for the app to function.
   */
  async boot({ dispatch }) {
    await dispatch("silentlyReauthenticate");
    await Promise.all([
      dispatch("loadListings"),
      dispatch("loadFavorited"),
      dispatch("loadTrashed")
    ]);
  },

  /**
   * Fetch listings from firebase.
   */
  async loadListings({ commit }) {
    commit("setListings");

    try {
      const listings: Listing[] = (
        await firestore
          .collection("listings")
          .orderBy("created_at", "desc")
          .limit(QUERY_LIMIT)
          .get()
      ).docs.map(snapshot => snapshot.data() as Listing);

      commit("setListings", listings);
    } catch (error) {
      console.error(error.message);

      throw new Error("Could not load listings from firebase.");
    }
  }
};

export default actions;
