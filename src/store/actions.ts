import { ActionTree } from 'vuex';
import { Listing, RootState, UserSettings } from '~/types';

import firebase, { auth, firestore } from '../firebase';

// if firebase.auth's state change observer for the state of currentUser hasn't
// resolved in this amount of time, we'll consider the user logged out.
const AUTH_STATE_TIMEOUT = 2500;

const waitForAuth = () =>
  new Promise<firebase.User>((resolve, reject) => {
    let isFulfilled = false;

    auth.onAuthStateChanged(user => {
      if (isFulfilled) {
        return;
      }

      isFulfilled = true;

      user ? resolve(user) : reject();
    });
  });

const authInitExpiration = () =>
  new Promise<firebase.User>((_, reject) =>
    setTimeout(reject, AUTH_STATE_TIMEOUT)
  );

const actions: ActionTree<RootState, RootState> = {
  async signIn({ commit, dispatch }, { email, password }) {
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await auth.signInWithEmailAndPassword(email, password);

    try {
      // wait for firebase.auth to return the current user, or the init timeout
      // to pass; whatever comes first. A rejection by either of the promises
      // will throw.
      const user = await Promise.race<firebase.User>([
        waitForAuth(),
        authInitExpiration()
      ]);

      commit("setUser", user);

      // because cloud firestore does not support disabling registration of
      // new users while keeping login for existing users working, anyone can
      // register an account with the firestore.
      //
      // Here we will check to see if the uid for the signed in user has been
      // explicitly flagged as 'active' in the 'users' collection, indicating
      // the signed in user is one that has been approved to use the application.
      const userSettings = (await firestore
        .collection("users")
        .doc(user.uid)
        .get()) as firebase.firestore.DocumentSnapshot<UserSettings>;

      if (!userSettings.exists || !(userSettings.data() || {}).active) {
        throw new Error("Unapproved/activated account.");
      }
    } catch (error) {
      console.error(error);
      dispatch("signOut");
      throw new Error("Invalid credentials or inactive account.");
    }
  },

  async signOut({ commit }) {
    commit("setUser");
    await auth.signOut();
  },

  async loadListings({ commit }) {
    try {
      const listings: Listing[] = (
        await firestore
          .collection(process.env.LISTING_COLLECTION as string)
          .where("rejected", "==", false)
          .orderBy("created_at", "desc")
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
