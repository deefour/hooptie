import Vehicle, { Trim } from "../Vehicle";

import { Details } from "./types";
import Listing from "../Listing";
import { MINIMUM_MILEAGE } from "../constants";
import Service from "./Service";
import { baseUrl } from ".";
import { isNil } from "lodash";

export default class ResultTransformer {
  constructor(
    readonly service: Service,
    readonly vehicle: Vehicle,
    readonly details: Details
  ) {
    //
  }

  title(): string {
    const trim = this.trim();

    return [
      this.details.make,
      this.details.model,
      trim !== undefined ? trim.name : undefined,
    ]
      .filter((p) => !isNil(p))
      .join(" ");
  }

  toListing(): Listing {
    return new Listing(
      this.service.identifier,
      this.vehicle.identifier,
      this.details.make,
      this.details.model,
      this.title(),
      this.price(),
      this.details.vin,
      this.trim(),
      this.details.year,
      new URL(`${baseUrl}/listings/${this.details.vin}`),
      this.details.zip,
      this.details.engine_type,
      this.details.transmission,
      this.details.exterior_color,
      this.mileage(),
      this.images(),
      this.details.lat,
      this.details.lon
    );
  }

  mileage(): number | undefined {
    if (
      this.details.mileage === undefined ||
      this.details.mileage < MINIMUM_MILEAGE
    ) {
      return undefined;
    }

    return this.details.mileage;
  }

  trim(): Trim | undefined {
    if (this.details.trim === undefined) {
      return undefined;
    }

    return new Trim(this.details.trim);
  }

  images(): URL[] {
    if (this.details.photo_urls === undefined) {
      return [];
    }

    return this.details.photo_urls.map((url) => new URL(url));
  }

  price(): number | undefined {
    let price = this.details.price;

    if (price !== undefined && price < 150) {
      price = undefined;
    }

    return price;
  }
}
