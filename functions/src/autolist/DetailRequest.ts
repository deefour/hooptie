import { ServiceRequest } from "../types";
import { baseUrl } from ".";
import { stringifyUrl } from "query-string";

export default class DetailRequest implements ServiceRequest {
  constructor(readonly vin: string) {
    //
  }

  searchParams(): URLSearchParams {
    return new URLSearchParams();
  }

  endpoint(): string {
    return `${baseUrl}/api/vehicles/${this.vin}`;
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
