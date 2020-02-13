import { get, isNil } from "lodash";

import { Details } from "./types";
import Listing from "../Listing";
import Service from "./Service";
import { Trim } from "../Vehicle";

const baseUrl = "";

export default class ResultTransformer {
  constructor(readonly service: Service, readonly details: Details) {
    //
  }

  title(): string {
    return [this.details.make, this.details.model, this.trim()]
      .filter(p => !isNil(p))
      .join(" ");
  }

  toListing(): Listing {
    return new Listing(
      this.service.identifier,
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
      this.images()
    );
  }

  mileage(): number {
    if (this.details.mileage < 150) {
      return -1;
    }

    return this.details.mileage;
  }

  trim(): Trim | undefined {
    if (this.details.trim === undefined) {
      return undefined;
    }

    return new Trim(this.details.trim);
  }

  spec(attribute: string) {
    return get(this.details, `specifications.${attribute}.value`);
  }

  images() {
    if (this.details.photo_urls === undefined) {
      return [];
    }

    return this.details.photo_urls.map(url => new URL(url));
  }

  price(): number | undefined {
    let price: number | undefined = get(
      this.details,
      "pricingDetail.primary",
      -1
    );

    if (price !== undefined && price < 150) {
      price = undefined;
    }

    return price;
  }
}