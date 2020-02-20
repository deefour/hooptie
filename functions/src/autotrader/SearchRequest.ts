import { intersection, keys, pickBy } from "lodash";
import { stringifyUrl } from "query-string";

import { baseUrl } from ".";
import Location from "../Location";
import { ServiceRequest } from "../types";
import Vehicle from "../Vehicle";

const drivelineMapping: { [key: string]: string[] } = {
  AWD4WD: ["awd", "4wd", "4x4"],
  FWD: ["fwd"],
  RWD: ["rwd"]
};

export default class SearchRequest implements ServiceRequest {
  constructor(
    readonly location: Location,
    readonly vehicle: Vehicle,
    readonly page: number,
    readonly recordsPerPage: number,
    readonly sortBy: string
  ) {
    //
  }

  driveGroups(): string[] {
    return keys(
      pickBy(drivelineMapping, pool =>
        intersection(pool, this.vehicle.drivelines)
      )
    );
  }

  engineCylinders(): string[] {
    return this.vehicle.cylinders.map(c => `${c}CLDR`);
  }

  startingRecord(): number {
    return this.recordsPerPage * (this.page - 1);
  }

  searchParams(): { [key: string]: any } {
    return {
      numRecords: this.recordsPerPage,
      firstRecord: this.startingRecord(),
      driveGroup: this.driveGroups().join(","),
      engineCodes: this.engineCylinders().join("|"),
      zip: this.location.zip_code,
      makeCodeList: this.vehicle.autotrader.make,
      modelCodeList: this.vehicle.autotrader.model,
      maxMileage: this.vehicle.max_mileage,
      minPrice: this.vehicle.min_price,
      maxPrice: this.vehicle.max_price,
      searchRadius: this.vehicle.radius,
      sortBy: this.sortBy,
      trimCodeList: this.trimCodes().join(","),
      startYear: this.vehicle.min_year,
      endYear: this.vehicle.max_year
    };
  }

  endpoint(): string {
    return `${baseUrl}/rest/searchresults/base`;
  }

  url(): URL {
    return new URL(
      stringifyUrl({
        url: this.endpoint(),
        query: this.searchParams()
      })
    );
  }

  trimCodes(): string[] {
    return this.vehicle.trims.map(
      trim => `${this.vehicle.autotrader.model}|${trim.name}`
    );
  }
}
