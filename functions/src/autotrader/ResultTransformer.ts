import { get } from "lodash";

import { baseUrl } from ".";
import { MINIMUM_MILEAGE } from "../constants";
import Listing from "../Listing";
import Vehicle, { Trim } from "../Vehicle";
import Service from "./Service";
import { SearchResult } from "./types";

export default class ResultTransformer {
  constructor(
    readonly service: Service,
    readonly vehicle: Vehicle,
    readonly result: SearchResult
  ) {
    //
  }

  toListing(): Listing {
    return new Listing(
      this.service.identifier,
      this.vehicle.identifier,
      this.result.make,
      this.result.model,
      this.result.title,
      this.price(),
      this.result.vin,
      this.trim(),
      this.result.year,
      new URL(this.result.website.href, baseUrl),
      this.result.zip,
      this.spec("engine"),
      this.spec("transmission"),
      this.spec("color"),
      this.mileage(),
      this.images(),
      undefined,
      undefined
    );
  }

  trim(): Trim | undefined {
    if (this.result.trim === undefined) {
      return undefined;
    }

    return new Trim(this.result.trim);
  }

  spec(attribute: string): any {
    return get(this.result, `specifications.${attribute}.value`);
  }

  mileage(): number | undefined {
    const rawMileage = this.spec("mileage");

    if (rawMileage === undefined) {
      return undefined;
    }
    const justNumbers = String(rawMileage)
      .replace(/\.\d+/, "")
      .replace(/\D/g, "");

    if (justNumbers.length === 0) {
      return undefined;
    }

    const asNumber = Number(justNumbers);

    if (isNaN(asNumber) || asNumber < MINIMUM_MILEAGE) {
      return undefined;
    }

    return asNumber;
  }

  images(): URL[] {
    if (this.result.images === undefined) {
      return [];
    }

    return this.result.images.sources.map(({ src: url }) => {
      // When autotrader image urls come through as //images.autotrader.com/...,
      // a protocol should be prepended.
      if (/^\/\//.test(url)) {
        url = `https:${url}`;
      }

      return new URL(url);
    });
  }

  price(): number | undefined {
    let price: number | undefined = get(
      this.result,
      "pricingDetail.primary",
      -1
    );

    if (price !== undefined && price < 150) {
      price = undefined;
    }

    return price;
  }
}
