import "firebase/auth";
import "firebase/firestore";

import config from "../firebase.client.js";
import firebase from "firebase/app";

export const app = firebase.initializeApp(config);

export default firebase;
export const firestore = app.firestore();
export const auth = app.auth();
