import { GetterTree } from 'vuex';
import { RootState } from '~/types';

export const getters: GetterTree<RootState, RootState> = {
  isAuthenticated: (_: RootState, getters) => !getters.isAnonymous,
  isAnonymous: state => state.user === undefined
};

export default getters;
