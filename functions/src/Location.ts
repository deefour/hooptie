import * as admin from "firebase-admin";

export default class Location {
  constructor(
    readonly latitude: number,
    readonly longitude: number,
    readonly city: string,
    readonly state: string,
    readonly zip_code: string
  ) {
    //
  }
}

// LocationData describes the expected structure of a firestore document from the
// "locations" collection.
interface LocationData extends admin.firestore.DocumentData {
  location: {
    latitude: number;
    longitude: number;
  };
  city: string;
  state: string;
  zip: string;
}

// transformDocumentSnapshotToLocation transforms a Cloud Firestore document data
// into a Location instance.
const transformDocumentDataToLocation = (data: LocationData): Location => {
  const {
    location: { latitude, longitude },
    city,
    state,
    zip_code: zip,
  } = data;

  return new Location(latitude, longitude, city, state, zip);
};

// getLocation asynchronously fetch the location details from Cloud Firestore, returning
// a Location instance for use in search services.
export const getLocation = async (): Promise<Location> => {
  const doc = await admin.firestore().doc("settings/location").get();

  if (!doc.exists) {
    throw new Error("No location document exists at [settings/location].");
  }

  return transformDocumentDataToLocation(doc.data() as LocationData);
};
