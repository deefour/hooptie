import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import * as shortid from "shortid";
import http from "../http";

/**
 * Determine whether the listing should have a representative image copied over
 * to the cloud storage bucket.
 *
 * @param {admin.firestore.DocumentSnapshot} snapshot
 * @returns boolean if 1+ photo URLs exist on the document
 */
const snapshotNeedsPhotoToBeStored = (
  snapshot: admin.firestore.DocumentSnapshot
): boolean => {
  const data = snapshot.data();

  if (data === undefined) {
    return false;
  }

  return data?.photo_urls?.length > 0;
};

/**
 * Copy a source image from the passed URL to the cloud storage bucket with an
 * object whose path prefix is the listing's VIN.
 *
 * @param {String} vin
 * @param {String} url
 * @returns {String} the public URL to the file in the cloud storage bucket.
 */
const copyPhotoToStorage = async (
  vin: string,
  url: string
): Promise<string> => {
  const storage = admin.storage();
  const bucket = storage.bucket();
  const objectPath = `${vin}/${shortid.generate()}.jpg`;
  const file = bucket.file(objectPath);
  const writeStream = file.createWriteStream();
  const response = await http.get(url);

  response.body.pipe(writeStream);

  return `https://storage.googleapis.com/${bucket.name}/${objectPath}`;
};

/**
 * Attempt to copy a representative image for a listing from the source CDN to
 * the cloud storage bucket, updating the listing document if successful.
 *
 * @param {admin.firestore.DocumentSnapshot} snapshot the snapshot of the just-created listing
 * @param  {functions.EventContext} context cloud function event context
 * @returns {Promise<admin.firestore.WriteResult | undefined} a successful write result, or nothing
 */
export default async (
  snapshot: admin.firestore.DocumentSnapshot,
  context: functions.EventContext
): Promise<admin.firestore.WriteResult | undefined> => {
  const vin = context.params.vin;

  if (!snapshotNeedsPhotoToBeStored(snapshot)) {
    console.info(`No image processing necessary for VIN [${vin || "unknown"}]`);
    return undefined;
  }

  try {
    const data = snapshot.data();

    if (data?.vin === undefined) {
      return undefined;
    }

    const previewURL = await copyPhotoToStorage(
      data.vin as string,
      data?.photo_urls?.[0]
    );

    const payload = {
      preview_photo_url: previewURL,
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    return snapshot.ref.update(payload);
  } catch (error) {
    console.error(error);
    return undefined;
  }
};
