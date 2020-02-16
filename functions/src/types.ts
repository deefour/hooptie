import Listing from "./Listing";
import Location from "./Location";
import Vehicle from "./Vehicle";

export interface SearchService {
  readonly identifier: string;
  readonly priority: number;
  readonly name: string;
  getListingsFor(vehicle: Vehicle): Promise<Listing[]>;
  getListingsForAll(vehicles: Vehicle[]): Promise<Listing[]>;
  deferredGetListingsForAll(vehicles: Vehicle[]): DeferredGetListings[];
}

export interface Settings {
  [key: string]: any;
}

export interface ServiceRequest {
  searchParams(): { [key: string]: any };
  endpoint(): string;
  url(): URL;
}
``;
export type ServiceFactory = (location: Location) => SearchService;

export type DeferredGetListings = () => Promise<Listing[]>;
