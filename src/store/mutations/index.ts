import { MutationTree } from "vuex";
import { Listing, RootState } from "~/types";

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
      email: user.email
    };
  },

  setListings(state, listings: Listing[] = []) {
    state.listings = listings;
  },

  setError(state, error?: Error) {
    state.error = error;
  },

  setActive(state, vin?: string) {
    state.active = vin;
  }
};

export default mutations;
