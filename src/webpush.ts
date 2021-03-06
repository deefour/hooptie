import { default as firebase, firestore, messaging } from "./firebase";
import {
  getCurrentUserNow,
  getCurrentUserWhenAvailable,
} from "./store/actions/auth";

import { User } from "firebase";

const sendTokenToServer = async (uid: string, token: string) =>
  firestore
    .doc(`users/${uid}`)
    .update({
      push_tokens: firebase.firestore.FieldValue.arrayUnion(token),
    })
    .catch((error) => {
      console.info(`Error setting token [${token}] for user [${uid}]`);
      console.error(error);
    });

/**
 * Fetch the current token for the device, if available, attempting to ask for
 * push permission first if necessary.
 *
 * @param {User} user the user currently authenticated against Firebase
 */
const syncPushToken = (messaging: firebase.messaging.Messaging, user: User) => {
  messaging
    .getToken()
    .then((token) => sendTokenToServer(user.uid, token))
    .catch((error) => {
      console.info(
        "Token generation failed. Most likely the user rejected the push permission opt-in."
      );
      console.error(error);
    });
};

if (messaging !== undefined) {
  /**
   * A promise to grab the current user. If one isn't immediately available, the
   * promise will resolve IF the user decides to login via Firebase auth observer.
   *
   * @var {Promise<User>}
   */
  const currentUser = Promise.race([
    getCurrentUserWhenAvailable(),
    getCurrentUserNow(),
  ]);

  messaging.usePublicVapidKey(process.env.FIREBASE_WEB_PUSH_KEY_PAIR as string);

  (async () => {
    // wait for a user to login
    const user = await currentUser;

    // try to sync a push token with the firestore document for their account
    syncPushToken(messaging, user);

    // attach a listener that will re-sync the token if an update is needed
    messaging.onTokenRefresh(syncPushToken.bind(undefined, messaging, user));
  })();

  /**
   * Simply log incoming messages from the ServiceWorker.
   */
  messaging.onMessage((payload) => console.log("Message received. ", payload));
}
