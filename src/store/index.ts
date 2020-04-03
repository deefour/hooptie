import Vue from "vue";
import Vuex from "vuex";
import { RootState } from "~/types";

import actions from "./actions";
import getters from "./getters";
import mutations from "./mutations";
import state from "./state";

Vue.use(Vuex);

export default new Vuex.Store<RootState>({
  state,
  getters,
  mutations,
  actions,
});
