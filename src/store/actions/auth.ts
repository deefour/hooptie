import { ActionTree } from "vuex";
import { RootState, UserSettings } from "~/types";

import firebase, { auth, firestore } from "../../firebase";

// if firebase.auth's state change observer for the state of currentUser hasn't
// resolved in this amount of time, we'll consider the user logged out.
const AUTH_STATE_TIMEOUT = 2500;

/**
 * Create a promise that attaches to firebase auth state handler. Resolve as soon
 * as the handler fires with a user.
 */
export const getCurrentUserWhenAvailable = () =>
  new Promise<firebase.User>(resolve => {
    let isFulfilled = false;

    auth.onAuthStateChanged(user => {
      if (isFulfilled || user === null) {
        return;
      }

      isFulfilled = true;
      resolve(user);
    });
  });

/**
 * Get the already-loaded user from the firestore auth instance. This is in place
 * just in case the auth instance holds a user prior to the authStateChanged handler
 * is attached in getCurrentUserWhenAvailable()
 *
 * This promise will never reject.
 */
export const getCurrentUserNow = () =>
  new Promise<firebase.User>(resolve => {
    if (auth.currentUser !== null) {
      resolve(auth.currentUser);
    }
  });

/**
 * If firebase takes too long to respond, consider the authentication having failed.
 *
 * This will cause a logout/cleanup of the state store.
 */
const consideredFailedAuthOnTimeout = () =>
  new Promise<firebase.User>((_, reject) =>
    setTimeout(reject, AUTH_STATE_TIMEOUT)
  );

const actions: ActionTree<RootState, RootState> = {
  async signIn({ dispatch }, { email, password }) {
    await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    await auth.signInWithEmailAndPassword(email, password);
    await dispatch("authenticate");
  },

  async silentlyReauthenticate({ dispatch }) {
    try {
      await dispatch("authenticate");
    } catch (error) {
      // discard the error
    }
  },

  async authenticate({ commit, dispatch }) {
    try {
      // wait for firebase.auth to return the current user, or the init timeout
      // to pass; whatever comes first. A rejection by either of the promises
      // will throw.
      const user = await Promise.race<firebase.User>([
        getCurrentUserNow(),
        getCurrentUserWhenAvailable(),
        consideredFailedAuthOnTimeout()
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

  /**
   * Clear the local user info and logout of the firebase auth.
   */
  async signOut({ commit }) {
    commit("setUser");
    await auth.signOut();
  }
};

export default actions;
