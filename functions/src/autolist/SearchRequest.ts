import Location from "../Location";
import { ServiceRequest } from "../types";
import Vehicle from "../Vehicle";
import { baseUrl } from ".";
import { stringifyUrl } from "query-string";

export default class SearchRequest implements ServiceRequest {
  constructor(
    readonly location: Location,
    readonly vehicle: Vehicle,
    readonly page: number,
    readonly sortBy: string
  ) {
    //
  }

  searchParams(): URLSearchParams {
    const params: { [key: string]: any } = {
      page: this.page,
      driveline: this.vehicle.drivelines.map(d => d.toUpperCase()),
      engine_cylinders: this.vehicle.cylinders,
      latitude: this.location.latitude,
      longitude: this.location.longitude,
      location: `${this.location.city}, ${this.location.state} ${this.location.zip_code}`,
      make: this.vehicle.make,
      model: this.vehicle.model,
      max_mileage: this.vehicle.max_mileage,
      price_min: this.vehicle.min_price,
      price_max: this.maxPrice(),
      radius: this.radius(),
      sort_filter: this.sortBy,
      trim: this.vehicle.trims.map(t => t.name),
      year_min: this.vehicle.min_year,
      year_max: this.maxYear()
    };

    return new URLSearchParams(
      Object.keys(params).map(key => [key, params[key]])
    );
  }

  maxPrice(): number {
    const limit = 999999;

    if (this.vehicle.max_price !== undefined) {
      return Math.min(this.vehicle.max_price, 999999);
    }

    return limit;
  }

  maxYear(): number {
    const limit = new Date().getFullYear() + 1;

    if (this.vehicle.max_year !== undefined) {
      // cap the max year at next year
      return Math.min(this.vehicle.max_year, limit);
    }

    return new Date().getFullYear() + 1;
  }

  radius(): number | string {
    if (this.vehicle.radius !== undefined) {
      return this.vehicle.radius > 0 ? this.vehicle.radius : "any";
    }

    return "any";
  }

  endpoint(): string {
    return `${baseUrl}/search`;
  }

  url(): URL {
    return new URL(
      stringifyUrl({
        url: this.endpoint(),
        query: this.searchParams()
      })
    );
  }
}
