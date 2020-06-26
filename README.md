
# Find My Hooptie

Find My Hooptie helps me track listings for vehicles I'm interested in across sites like AutoTrader and Autolist.

The frontend application runs on [Netlify](https://www.netlify.com). Data updates and persistence is provided by Google's [Cloud Functions](https://firebase.google.com/products/functions/),  [Cloud Firestore](https://firebase.google.com/products/firestore/), [Firebase Authentication](https://firebase.google.com/products/auth/), [Firebase Cloud Messaging](https://firebase.google.com/products/cloud-messaging), and the [Maps Platform](https://cloud.google.com/maps-platform/maps/).


## Motivation

There tends to be a lot of overlap on vehicle listings between AutoTrader, Autolist, and other similar services. Some allow users to "favorite" listings, but none seem to offer the ability to "trash" or "reject" them.

I am tired of checking multiple listing services daily for the same 2-3 vehicles I'm interested in, seeing the same listings I've seen every day prior and already dismissed, hoping to come across a new vehicle worth further consideration.

I also wanted an excuse to work with Firebase.

So I built this application.

Find My Hooptie:

 - periodically performs a search for each configured vehicle against listing services
 - begins tracking new, relevant vehicles
 - sends a [Web Push](https://developer.mozilla.org/en-US/docs/Web/API/Push_API) to subscribed devices, notifying them of the newly available vehicles
 - allows authenticated users to make a decision about the vehicles *(by favoriting or dismissing each)*

## Design

### The Frontend

The [src/](https://github.com/deefour/hooptie/tree/master/src) directory contains a tiny [Vue.js](https://www.vuejs.org) application that talks to a [Cloud Firestore](https://firebase.google.com/products/firestore/) instance.

This application displays documents from the `listings` collection and, when authenticated, allows a user to "favorite" or "trash" individual listings.

The listing details, including whether it's been marked as a favorite and/or trashed, are visible to both anonymous and authenticated users.

Only [admin users](#admin-users) are allowed to login and modify listing data.

### The Backend

The Cloud Firestore instance has a single document describing a location from which searches should originate _(stored in `settings/location`)_, and vehicles to search for _(stored as individual documents in the `vehicles` collection)_.

__These documents must be manually created.__ See the [Cloud Firestore Structure](#firestore-structure) section below for more information.

A few [cloud functions](https://github.com/deefour/hooptie/tree/master/functions) are used to update documents in a `listings` collection.

A [scheduled cloud function](https://firebase.google.com/docs/functions/schedule-functions) runs [twice a day](https://github.com/deefour/hooptie/tree/master/functions/src/index.ts), fetching search results from supported services and updating the Cloud Firestore instance as necessary *(results are stored in a normalized format as documents in the `listings` collection)*.

When a new listing is created, an [`onCreate()`](https://firebase.google.com/docs/reference/functions/providers_firestore_.documentbuilder.html#on-create) [Cloud Firestore Trigger](https://firebase.google.com/docs/functions/firestore-events) runs a background function that will add the following additional information to the new document if a `zip_code` is present:

 1. City, state, and latitude/longitude coordinate for the `zip_code` via Google's [Geocoding API](https://developers.google.com/maps/documentation/geocoding/start).
 2. Distance *(in meteres)* from the origin location to the geocoded coordinate via Google's [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/start).

<a name="firestore-structure"></a>
## Cloud Firestore Structure

Most collections and documents in the Cloud Firestore are auto-generated as the cloud functions and Vue.js app interact with the database. There are however a few documents that need to be manually created.

### The `settings` Collection

A `user-whitelist` document must exist to allow a whitelisted set of users to make changes to listing data while authenticated. This document currently only requires an `"admins"` attribute. The format and purpose of this is described in the [Admin Users section](#admin-users) of this document.

#### Location for Search Origination

A `location` document must exist with the following attributes to describe the origin from which searches should be made. This location is passed along to some of the vehicle listing services and is used by Google's Distance Matrix API to calculate the approximate distance between you and each vehicle.

```json
{
  "city": "Seymour",
  "location": [41.0, 73.0],
  "state":  "CT",
  "zip_code": "06483"
}
```

### The `vehicles` Collection

A document must exist in the `vehicles` collection for each search to be performed. Here is the JSON representation of the document used to search for a [2018+ Subaru Outback Touring 3.6R](examples/vehicles/outback-touring-36r.json) I'm interested in.

```json
{
  "active": true,
  "autotrader": {
    "make": "SUB",
    "model": "SUBOUTBK"
  },
  "cylinders": [6],
  "description": "low mile 2018+ Subaru Outback Touring 3.6R",
  "identifier": "sub-outbk-touring",
  "make": "Subaru",
  "max_mileage": 25000,
  "max_price": 36000,
  "min_year": 2018,
  "model": "Outback",
  "title": "Touring Outback",
  "trims": ["Touring", "Touring XT"],
}
```

Two more examples are a search for a [2002-2004 V8 Jeep Grand Cherokee](examples/vehicles/grand-cherokee-wj-v8.json) and a [well-optioned 2016+ V6 Toyota Tacoma](examples/vehicles/tacoma-v6.json).

While the rest of this section describes expectations on the structure of the `vehcicles` documents in _some_ detail, the best resource is the `Vehicle`, `Trim`, and `AutoTraderCode` types in the [base `types.ts` file](https://github.com/deefour/hooptie/blob/master/src/types.ts).

Here is a complete list of __optional__ attributes:

 - `cylinders`
 - `drivelines`
 - `trims`
 - `max_mileage`
 - `min_year`
 - `max_year`
 - `min_price`
 - `max_price`
 - `radius`

Here is a complete list of __required__ attributes:

 - `autotrader` *([learn more](#the-autotrader-attribute))*
 - `description`
 - `identifier`
 - `title`
 - `make`
 - `model`
 - `active` *(boolean)*: should the vehicle appear in the UI and searches be performed against the listing services?

<a name="the-autotrader-attribute"></a>
#### The `autotrader` Attribute

AutoTrader.com uses a special `make` and `model` code to match specific vehicles. Here are some examples:

 - Subaru Outback: `{ "make": "SUB", "model": "SUBOUTBK" }`
 - Jeep Grand Cherokee: `{ "make": "JEEP", "model": "JEEPGRAND" }`
 - Toyota Tacoma: `{ "make": "TOYOTA", "model": "TACOMA" }`

These codes can be seen in the URL querystring when you go to AutoTrader.com and perform a search under `"makeCodeList"` and `"modelCodeList"`. For example

    ...?makeCodeList=JEEP&modelCodeList=JEEPGRAND&...

<a name="admin-users"></a>
## Admin Users

The only users allowed to login and modify listing data are those whose `uid` is set in the `admins` map in a `settings/user-whitelist` document in the Cloud Firestore.

If your `uid` is found to be `FmGg4uKkYHXRUTPgYC0kCCh1fhr1`, the `user-whitelist` document found in the `settings` collection might look like this:

```json
{
  "admins": [
    "FmGg4uKkYHXRUTPgYC0kCCh1fhr1"
  ]
}
```

Firebase Authentication does not support disabling new user registrations. [Here is one Github issue on the topic](https://github.com/firebase/firebaseui-web/issues/99). Hooptie does not display a registration form, but it's still tehcnically possible for someone to create a new user in your Firebase project. It's because of this that the `user-whitelist` document is needed to allow only intended users to make changes to listing data.

Check out the [`firestore.rules` file](https://github.com/deefour/hooptie/tree/master/firestore.rules) to see how this `uid` whitelist is used to authorize certain requests.

## Deployment

### Bugsnag

If you'd like errors to be reported to [Bugsnag](https://bugsnag.com), create a Vue.js project through your Bugsnag account and set the API key in your production environment as `BUGSNAG_API_KEY`.

### Firebase Credentials

Values for all environment variables found in the [`.env.example`](https://github.com/deefour/hooptie/tree/master/.env.example) file need to be set on the environment used when `NODE_ENV=production yarn build` is run.

Locally this means having a `.env` or `.env.production` file present and properly filled out.

When using Netlify this means setting [builde environment variables](https://docs.netlify.com/configure-builds/environment-variables/).

### The Vue.js SPA

Netlify automatically pulls, builds, and publishes the latest `HEAD` commit in the `master` branch in the [Github repo](https://github.com/deefour/hooptie). Simply push to `master` to update the user-facing website.

### The Cloud Functions

Deploying the cloud functions requires that the [Firebase CLI](https://firebase.google.com/docs/cli) be installed on your system.

#### Configuration

Some of the cloud functions rely on configuration that is not automatically brought into the environment during deployment. Each configuration's key / value pair can be set through the firebase CLI with a command in this format:

```bash
firebase functions:config:set [key]=[value]
```

Learn more about [environment configuration](https://firebase.google.com/docs/functions/config-env).

The following configuration is needed:

#### Application URL

Some Web Push impelementations support clicking through to a destination URL. This should be the base URL for the hooptie application in production.

This application URL needs to be configured under the `app.url` key.

```bash
firebase functions:config:set app.url="[full application url here]"
```

#### Google Maps services API key

An API key must be generated through the [Google Cloud Platform Console](https://cloud.google.com/console/google/maps-apis/overview) with privileges to interact with the following API's:

 - [Geocoding API](https://developers.google.com/maps/documentation/geocoding/start)
 - [Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/start)

This key needs to be configured under the `credentials.maps_key` key.

```bash
firebase functions:config:set credentials.maps_key="[your api key here]"
```

Learn more about [getting an API key](https://developers.google.com/maps/documentation/geocoding/get-api-key) from the Google Cloud Platform Console.

##### Web Push certificate key pair

From the [Cloud Messaging](https://console.firebase.google.com/u/0/project/_/settings/cloudmessaging/) tab of your Firebase project's Settings tab, click __Generate Key Pair__.

This key pair needs to be configured under the `credentials.web_push` key.

```bash
firebase functions:config:set credentials.web_push="[your key pair here]"
```

Learn more about [configuring web credentials with FCM](https://firebase.google.com/docs/cloud-messaging/js/client#configure_web_credentials_with_fcm).

#### Publishing

With the above configuration in place, deploy the functions by running the following command:

```bash
firebase deploy --only functions
```

(c) 2020 Jason Daly (jason@deefour.me)
