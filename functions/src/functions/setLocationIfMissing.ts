import {
  Client,
  DistanceMatrixResponse,
  GeocodeResponse
} from "@googlemaps/google-maps-services-js";
import {
  AddressComponent,
  GeocodeResult
} from "@googlemaps/google-maps-services-js/dist/common";
import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { isNil, omitBy } from "lodash";

/**
 * A latitude/longitude coordinate pair.
 */
interface Coordinate {
  lat: number;
  lng: number;
}

/** Google map services client */
const client = new Client({});

/** API key for google maps service */
const apiKey = functions.config().credentials.maps_key;

/**
 * Fetch the distance between the location of the vehicle and the source location
 * in Cloud Firestore from which all searches originate.
 *
 * @param {Coordinate} destination latitude/longitude for the location of the vehicle
 * @param {string} apiKey the distanncematrix API key
 * @return {Promise<number | undefined>} the distance in feet, if available
 */
const getDistanceValue = async (
  source: Coordinate,
  destination: Coordinate,
  apiKey: string
): Promise<number | undefined> => {
  try {
    const distanceResponse: DistanceMatrixResponse = await client.distancematrix(
      {
        params: {
          origins: [[source.lat, source.lng]],
          destinations: [[destination.lat, destination.lng]],
          key: apiKey
        }
      }
    );

    return distanceResponse?.data?.rows?.[0]?.elements?.[0].distance.value;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

/**
 * Given a zip code, ask Google's geocoding service to provide details on that
 * location, returning the first result, if available.
 *
 * @param {string} zipCode the zip code from the vehicle listing to geocode
 * @param {string} apiKey google geocoder API key
 * @return {Promise<GeocodeResult | undefined>} The first geocoder service result
 */
const geocodeZipCode = async (
  zipCode: string,
  apiKey: string
): Promise<GeocodeResult | undefined> => {
  let geoResponse: GeocodeResponse;

  if (zipCode.trim().length === 0) {
    return undefined;
  }

  try {
    geoResponse = await client.geocode({
      params: {
        address: zipCode,
        key: apiKey
      }
    });

    return geoResponse?.data?.results?.[0];
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

/**
 * Sift through the array of address_components on the geocoder result for one tagged
 * with the passed type.
 *
 * @param {GeocodeResult} result the geocoder API result for the vehicle listing's location
 * @param {string} componentType the 'type' of address component to search for
 * @param {string} attributeName the attribute to pluck from the address component
 * @return {string | undefined} the long form name value for the component type, if available
 */
const getAddressType = (
  result: GeocodeResult,
  componentType: string,
  attributeName: "long_name" | "short_name"
): string | undefined => {
  const component = result.address_components.find(
    (component: AddressComponent) =>
      component.types.some(type => type.toLowerCase() === componentType)
  );

  return component?.[attributeName];
};

const snapshotRequiresGeocoding = (
  snapshot: admin.firestore.DocumentSnapshot
): boolean => {
  const data = snapshot.data();

  return (
    !isNil(data) &&
    isNil(data?.location) &&
    /^\d{5}(-\d{4})?$/.test(data.zip_code ?? "")
  );
};

/**
 * Get coordinates for the origin location by fetching the document in the
 * Cloud Firestore at settings/location.
 *
 * @return {Promise<Coordinate | undefined>}
 */
const getSourceCoordinate = async (): Promise<Coordinate | undefined> => {
  try {
    const location = (
      await admin
        .firestore()
        .doc("settings/location")
        .get()
    ).data()?.location as admin.firestore.GeoPoint;

    return {
      lat: location.latitude,
      lng: location.longitude
    };
  } catch (error) {
    console.error(error);

    return undefined;
  }
};

export default async (
  snapshot: admin.firestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<admin.firestore.WriteResult | undefined> => {
  const vin = context.params.vin;

  if (!snapshotRequiresGeocoding(snapshot)) {
    console.info(`No geocoding necessary for VIN [${vin || "unknown"}]`);
    return undefined;
  }

  const geocodeResult = await geocodeZipCode(
    snapshot.data()?.zip_code ?? "",
    apiKey
  );

  if (geocodeResult === undefined) {
    console.info(`Geocoder lookup did not return a result for VIN [${vin}]`);
    return undefined;
  }

  const location = geocodeResult?.geometry?.location;
  const source = await getSourceCoordinate();

  console.info(`Updating location for VIN [${vin}]`);

  const payload = {
    location: new admin.firestore.GeoPoint(location.lat, location.lng),
    city: getAddressType(geocodeResult, "locality", "long_name"),
    state: getAddressType(
      geocodeResult,
      "administrative_area_level_1",
      "short_name"
    ),
    distance: source
      ? await getDistanceValue(source, location, apiKey)
      : undefined,
    updated_at: admin.firestore.FieldValue.serverTimestamp()
  };

  return snapshot.ref.update(omitBy(payload, isNil));
};
