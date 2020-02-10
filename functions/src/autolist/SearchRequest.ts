import Location from "../Location";
import { ServiceRequest } from "../types";
import Vehicle from "../Vehicle";
import { baseUrl } from ".";
import queryString from "query-string";

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
      price_max: Math.min(this.vehicle.max_price, 999999),
      radius: this.radius(),
      sort_filter: this.sortBy,
      trim: this.vehicle.trims.map(t => t.name),
      year_min: this.vehicle.min_year,
      year_max: Math.min(new Date().getFullYear() + 1, this.vehicle.max_year)
    };

    return new URLSearchParams(
      Object.keys(params).map(key => [key, params[key]])
    );
  }

  radius(): number | string {
    return this.vehicle.radius > 0 ? this.vehicle.radius : "any";
  }

  endpoint(): string {
    return `${baseUrl}/search`;
  }

  url(): URL {
    return new URL(
      queryString.stringifyUrl({
        url: this.endpoint(),
        query: this.searchParams()
      })
    );
  }
}
