import * as admin from 'firebase-admin';

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

export const getLocation = async (): Promise<Location> => {
  const doc = await admin
    .firestore()
    .doc("settings/location")
    .get();

  if (!doc.exists) {
    throw new Error("No location document exists at [settings/location].");
  }

  return transformDocumentSnapshotToLocation(doc.data() as LocationSnapshot);
};

const transformDocumentSnapshotToLocation = (
  data: LocationSnapshot
): Location => {
  const {
    coordinates: { latitude, longitude },
    city,
    state,
    zip
  } = data;

  return new Location(latitude, longitude, city, state, zip);
};

interface LocationSnapshot extends admin.firestore.DocumentData {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  city: string;
  state: string;
  zip: string;
}
