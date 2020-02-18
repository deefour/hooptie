importScripts("https://www.gstatic.com/firebasejs/7.8.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.8.1/firebase-messaging.js");

firebase.initializeApp({
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID
});
