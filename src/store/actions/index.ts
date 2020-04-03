import { Listing, RootState, Vehicle } from "~/types";

import { ActionTree } from "vuex";
import { QUERY_LIMIT } from "../../constants";
import auth from "./auth";
import decisions from "./decisions";
import { firestore } from "../../firebase";

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
      dispatch("loadVehicles"),
      dispatch("loadFavorited"),
      dispatch("loadTrashed"),
    ]);
  },

  toggleRejector({ commit }, id: string) {
    commit("togleRejector", id);
    commit("setPage");
  },

  async loadVehicles({ commit }) {
    const vehicles = (await firestore.collection("vehicles").get()).docs.map(
      (snapshot) => snapshot.data() as Vehicle
    );

    if (vehicles.length === 0) {
      throw new Error("No vehicles exist in the [vehicles] collection.");
    }

    commit("setVehicles", vehicles);
  },

  /**
   * Fetch listings from firebase.
   */
  async loadListings({ commit }) {
    commit("setListings");

    const listings: Listing[] = (
      await firestore
        .collection("listings")
        .orderBy("created_at", "desc")
        .limit(QUERY_LIMIT)
        .get()
    ).docs.map((snapshot) => snapshot.data() as Listing);

    commit("setListings", listings);
    commit("setPage");
  },
};

export default actions;
