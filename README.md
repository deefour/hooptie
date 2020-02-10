# Hooptie UI

The companion to [hooptie-cli](https://github.com/deefour/hooptie-cli), this SPA displays listings that have been persisted in the Cloud Firestore and are awaiting review.


## Installation

### Firebase Configuration

First, [create a Cloud Firestore database](https://firebase.google.com/docs/firestore/quickstart#create).

Firebase client credentials are needed to interact with the project. [Add Firebase to your web service](https://cloud.google.com/appengine/docs/standard/python3/building-app/adding-firebase#adding_firebase_to_your_web_service).

Grab the __Firebase SDK snippet__ and create a new `firebase.config.js` in the project root that exports that credentials object

```javascript
module.exports = {
  // web app credentials here...
};
```

Install the [Firebase CLI](https://firebase.google.com/docs/cli), login, and initialize the project for firestore.

```bash
yarn global add firebase-tools
```

Create a `.firebaserc` file in the project root with the name of your firebase project configured.

```json
{
  "projects": {
    "default": "[your-firebase-project]"
  }
}
```
