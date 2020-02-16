
# Find My Hooptie

Find My Hooptie helps me track listings for vehicles I'm interested in across sites like AutoTrader and Autolist.

The frontend application runs on [Netlify](https://www.netlify.com). Data updates and persistence is provided by Google's [Cloud Functions](https://firebase.google.com/products/functions/),  [Cloud Firestore](https://firebase.google.com/products/firestore/), [Firebase Authentication](https://firebase.google.com/products/auth/) and the [Maps Platform](https://cloud.google.com/maps-platform/maps/).

Available at [https://hooptie.deefour.me](https://hooptie.deefour.me)

## Design

### The Frontend

The [src/](https://github.com/deefour/hooptie/tree/master/src) directory contains a tiny [Vue.js](https://www.vuejs.org) application that talks to a [Cloud Firestore](https://firebase.google.com/products/firestore/) instance.

This application displays documents from the `listings` collection and, when authenticated, allows a user to "favorite" or "discard" individual listings.

The listing details, including whether it's been marked as a favorite and/or discarded, is visible to anonymous and authenticated users.

Only user's with a document keyed by their  `uid` present in the `users` collection containing the following JSON-equivalent attributes are allowed to login and modify listing data.

```json
{
  "active": true
}
```

### The Backend

The Cloud Firestore instance has a single document describing a location from which searches should originate _(stored in `settings/location`)_, and vehicles to search for _(stored as individual documents in the `vehicles` collection)_.

A few [cloud functions](https://github.com/deefour/hooptie/tree/master/functions) are used to update documents in a `listings` collection.

A [scheduled cloud function](https://firebase.google.com/docs/functions/schedule-functions) runs [twice a day](https://github.com/deefour/hooptie/tree/master/functions/src/index.ts), fetching search results from supported services and updating the Cloud Firestore instance as necessary *(results are stored in a normalized format as documents in the `listings` collection)*.

When a new listing is created, an [`onCreate()`](https://firebase.google.com/docs/reference/functions/providers_firestore_.documentbuilder.html#on-create) [Cloud Firestore Trigger](https://firebase.google.com/docs/functions/firestore-events) runs a background function that will add the following additional information to the new document if a `zip_code` is present:

 1. City, state, and latitude/longitude coordinate for the `zip_code` via Google's Geocoder API
 2. Distance *(in feet)* from the origin location to the geocoded coordinate.


## Motivation

There tends to be a lot of overlap on vehicles listings between AutoTrader, Autolist, and other similar services. Some services allow users to "favorite" listings, but none seem to offer the ability to "discard" or "reject" them.

I am tired of checking multiple listing services daily for the same 2-3 vehicles I'm interested in, seeing the same listings I've seen every day prior and already dismissed, hoping to come across a new listing worth further consideration.

I also wanted an excuse to work with Firebase.

So I built this application.

Find my hooptie let's me check in once or twice a day, __immediately__ see if new listings are available for __all__ vehicles I am interested in across __all__ listing services, and __permanently dismiss__ listings that are not the right fit.


## Deployment

### Firebase Credentials

Coming soon...

### The Vue.js SPA

Netlify automatically pulls, builds, and publishes the latest `HEAD` commit in the `master` branch in the [Github repo](https://github.com/deefour/hooptie). Simply push to `master` to update the user-facing website.

### The Cloud Functions

Deploying the cloud functions requires that the [Firebase CLI](https://firebase.google.com/docs/cli) be installed on your system.

The cloud functions that interact with the Google Maps services expect an API Key with privileges to the following services be created:

 - Geocoding API
 - Distance Matrix API

The API key needs to then be set via the Firebase CLI. Learn more about [environment configuration](https://firebase.google.com/docs/functions/config-env).

```bash
firebase functions:config:set credentials.maps_key="[API_KEY_HERE]"
```

Finally, deploy the functions by running the following command:

```bash
firebase deploy --only functions
```


(c) 2020 Jason Daly (jason@deefour.me)
