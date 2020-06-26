import { ActionTree } from "vuex";
import { Listing, RootState, Vehicle } from "~/types";

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
      dispatch("loadVehicles"),
      dispatch("loadFavorited"),
      dispatch("loadTrashed"),
    ]);

    // listings can only be loaded after vehicle data has been fetched. the listings
    // collection query relies on the search_identifier fields from the vehicle data.
    await dispatch("loadListings");
  },

  toggleRejector({ commit }, id: string) {
    commit("toggleRejector", id);
    commit("setPage");
  },

  async loadVehicles({ commit }) {
    const vehicles = (
      await firestore.collection("vehicles").where("active", "==", true).get()
    ).docs.map((snapshot) => snapshot.data() as Vehicle);

    if (vehicles.length === 0) {
      throw new Error("No vehicles exist in the [vehicles] collection.");
    }

    commit("setVehicles", vehicles);
  },

  /**
   * Fetch listings from firebase.
   */
  async loadListings({ commit, state }) {
    commit("setListings");

    const searchIdentifiers = state.vehicles.reduce(
      (acc, vehicle: Vehicle) => acc.add(vehicle.identifier),
      new Set()
    );

    if (searchIdentifiers.size === 0) {
      throw new Error("Each vehicle must have a [identifier] field.");
    }

    const listings: Listing[] = (
      await firestore
        .collection("listings")
        .where(
          "search_identifier",
          "in",
          Array.from(searchIdentifiers.values())
        )
        .orderBy("created_at", "desc")
        .limit(QUERY_LIMIT)
        .get()
    ).docs.map((snapshot) => snapshot.data() as Listing);

    commit("setListings", listings);
    commit("setPage");
  },
};

export default actions;
