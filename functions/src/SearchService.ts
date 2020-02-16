import { flatten } from "lodash";

import Listing from "./Listing";
import Location from "./Location";
import { DeferredGetListings, SearchService, ServiceFactory } from "./types";
import Vehicle from "./Vehicle";

// getSearchServices builds a Map of supported search services, using each service's
// identifier as the keys.
export const makeSearchServices = (
  services: ServiceFactory[],
  location: Location
): Map<string, SearchService> =>
  // build the search services, injecting the location into each, since it is a
  // constant, known point to search against regardless of vehicle.
  services
    .map(service => service(location))
    .reduce(
      (acc, service) => acc.set(service.identifier, service),
      new Map<string, SearchService>()
    );

export abstract class AbstractSearchService implements SearchService {
  abstract readonly identifier: string;
  abstract readonly priority: number;
  abstract readonly name: string;

  abstract getListingsFor(vehicle: Vehicle): Promise<Listing[]>;

  getListingsForAll(vehicles: Vehicle[]): Promise<Listing[]> {
    return Promise.all(
      vehicles.map(vehicle => this.getListingsFor(vehicle))
    ).then(flatten);
  }

  deferredGetListingsForAll(vehicles: Vehicle[]): DeferredGetListings[] {
    return vehicles.map(vehicle => this.getListingsFor.bind(this, vehicle));
  }
}
