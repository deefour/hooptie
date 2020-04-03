import { MutationTree } from "vuex";
import { Decision, RootState } from "~/types";

const mutations: MutationTree<RootState> = {
  addFavorite(state, payload: Decision) {
    state.favorited.push(payload);
  },

  removeFavorite(state, { vin }: { vin: string }) {
    state.favorited = state.favorited.filter((t: Decision) => t.vin !== vin);
  },

  restore(state, { vin }: { vin: string }) {
    state.trashed = state.trashed.filter((t: Decision) => t.vin !== vin);
  },

  addToTrash(state, payload: Decision) {
    state.trashed.push(payload);
  },

  setTrashed(state, trashed: Decision[] = []) {
    state.trashed = trashed;
  },

  setFavorited(state, favorited: Decision[] = []) {
    state.favorited = favorited;
  },
};

export default mutations;
