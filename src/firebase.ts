import "firebase/auth";
import "firebase/firestore";

import firebase from "firebase/app";

export const app = firebase.initializeApp(
  require("../credentials.client.json")
);

export default firebase;
export const firestore = app.firestore();
export const auth = app.auth();
