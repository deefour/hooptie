importScripts("https://www.gstatic.com/firebasejs/7.8.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.8.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
});

const messaging = firebase.messaging();
