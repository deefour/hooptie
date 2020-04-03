import { stringifyUrl } from "query-string";

import { baseUrl } from ".";
import { ServiceRequest } from "../types";

export default class DetailRequest implements ServiceRequest {
  constructor(readonly vin: string) {
    //
  }

  searchParams(): { [key: string]: any } {
    return {};
  }

  endpoint(): string {
    return `${baseUrl}/api/vehicles/${this.vin}`;
  }

  url(): URL {
    return new URL(
      stringifyUrl({
        url: this.endpoint(),
        query: this.searchParams(),
      })
    );
  }
}
