import admin = require("firebase-admin");

import {
  isArray,
  isEmpty,
  isNil,
  isNumber,
  isPlainObject,
  isString,
  omitBy
} from "lodash";

import { SearchService } from "./types";
import { Trim } from "./Vehicle";

export default class Listing {
  readonly vin: string;

  constructor(
    readonly service: string,
    readonly search: string,
    readonly make: string,
    readonly model: string,
    protected readonly _title: string | undefined,
    readonly price: number | undefined,
    vin: string,
    readonly trim: Trim | undefined,
    readonly year: number,
    readonly url: URL,
    readonly zip_code: string | undefined,
    readonly engine: string | undefined,
    readonly transmission: string | undefined,
    readonly color: string | undefined,
    readonly mileage: number | undefined,
    readonly images: URL[],
    readonly latitude: number | undefined,
    readonly longitude: number | undefined
  ) {
    this.vin = vin.toUpperCase();
  }

  title(): string {
    return this._title || `${this.year} ${this.make} ${this.model}`;
  }

  toJSON(): object {
    return {
      service: this.service,
      search_identifier: this.search,
      make: this.make,
      model: this.model,
      price: this.price,
      title: this.title(),
      latitude: this.latitude,
      longitude: this.longitude,
      vin: this.vin,
      year: this.year,
      url: this.url.toString(),
      zip_code: this.zip_code,
      engine: this.engine,
      mileage: this.mileage,
      transmission: this.transmission,
      trim: this.trim !== undefined ? this.trim.name : undefined,
      color: this.color,
      images: this.images.map(image => image.toString())
    };
  }

  toDocumentData(): object {
    // reject keys with undefined or empty values
    let data: { [key: string]: any } = omitBy(this.toJSON(), v => {
      if (isNil(v)) {
        return true;
      }

      if ((isString(v) || isArray(v) || isPlainObject(v)) && isEmpty(v)) {
        return true;
      }

      if (isNumber(v) && v < 0) {
        return true;
      }

      return false;
    });

    if (!isNil(data.latitude) && !isNil(data.longitude)) {
      // if coordinates are present, swap them out for a location GeoPoint
      const { latitude, longitude, ...rest } = data;

      data = {
        ...rest,
        location: new admin.firestore.GeoPoint(
          latitude as number,
          longitude as number
        )
      };
    }

    return data;
  }
}

export const duplicateListingReducer = (
  services: Map<string, SearchService>
) => (acc: Map<string, Listing>, listing: Listing): Map<string, Listing> => {
  if (!acc.has(listing.vin)) {
    // if a listing for the VIN doesn't exist in the map, set it!
    acc.set(listing.vin, listing);
  }

  const a = services.get(listing.service);
  const b = services.get((acc.get(listing.vin) as Listing).service);

  if (a && b && a.priority > b.priority) {
    // if the incoming listing's service priority is greater than the one currently
    // in the map, replace it!
    acc.set(listing.vin, listing);
  }

  return acc;
};
