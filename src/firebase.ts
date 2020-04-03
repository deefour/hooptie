import "firebase/auth";
import "firebase/messaging";
import "firebase/firestore";

import firebase from "firebase/app";

export const app = firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
});

export default firebase;
export const firestore = app.firestore();
export const auth = app.auth();

// Instantiating a firebase.messaging.Messaging instance will cause errors in
// browsers like older Mac Safari and even more recent iOS Safari that don't
// support WebPush.
//
// The export here is conditionally set because of this.
export let messaging: firebase.messaging.Messaging | undefined = undefined;

if (firebase.messaging.isSupported()) {
  messaging = app.messaging();
}
