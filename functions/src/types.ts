import Listing from "./Listing";
import Vehicle from "./Vehicle";

export interface SearchService {
  readonly identifier: string;
  readonly priority: number;
  readonly name: string;
  getListings(vehicle: Vehicle): Promise<Listing[]>;
}

export interface Settings {
  [key: string]: any;
}

export interface ServiceRequest {
  searchParams(): URLSearchParams;
  endpoint(): string;
  url(): URL;
}
