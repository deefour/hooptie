import Listing from "../Listing";
import { SearchResult } from "./types";
import Service from "./Service";
import { Trim } from "../Vehicle";
import { baseUrl } from ".";
import { get } from "lodash";

export default class ResultTransformer {
  constructor(readonly service: Service, readonly result: SearchResult) {
    //
  }

  toListing(): Listing {
    return new Listing(
      this.service.identifier,
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
      Number(this.spec("mileage") || -1),
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

  spec(attribute: string) {
    return get(this.result, `specifications.${attribute}.value`);
  }

  images() {
    if (this.result.images === undefined) {
      return [];
    }

    return this.result.images.sources.map(({ src: url }) => new URL(url));
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
