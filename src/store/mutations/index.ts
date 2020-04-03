import { Listing, RootState, Vehicle } from "~/types";

import { MutationTree } from "vuex";
import decisions from "./decisions";

const mutations: MutationTree<RootState> = {
  ...decisions,

  setUser(state, user: firebase.User | undefined = undefined) {
    if (user === undefined) {
      state.user = undefined;
      return;
    }

    if (user.uid === null || user.email === null) {
      throw new Error("Unsupported/incomplete user provided.");
    }

    state.user = {
      uid: user.uid,
      email: user.email,
    };
  },

  setListings(state, listings: Listing[] = []) {
    state.listings = listings;
  },

  setVehicles(state, vehicles: Vehicle[] = []) {
    state.vehicles = vehicles;
  },

  setError(state, error?: Error) {
    state.error = error;
  },

  setActive(state, vin?: string) {
    state.active = vin;
  },

  toggleRejector(state, id) {
    const index = state.rejectors.findIndex(
      (haystackId: string): boolean => haystackId === id
    );

    if (index >= 0) {
      state.rejectors.splice(index, 1);
    } else {
      state.rejectors.push(id);
    }
  },

  setPage(state, page = 1) {
    state.page = Math.max(page, 1);
  },
};

export default mutations;
