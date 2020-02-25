import * as pMap from "p-map";

import { Details, SearchResult } from "./types";

import { AbstractSearchService } from "../SearchService";
import DetailRequest from "./DetailRequest";
import Listing from "../Listing";
import Location from "../Location";
import { REQUEST_CONCURRENCY } from "../constants";
import ResultTransformer from "./ResultTransformer";
import SearchRequest from "./SearchRequest";
import Vehicle from "../Vehicle";
import http from "../http";

export default class Service extends AbstractSearchService {
  readonly identifier = "autolist";
  readonly name = "Autolist";
  readonly priority = 100;
  protected page = 1;

  constructor(
    readonly location: Location,
    protected readonly sortBy: string = "mileage"
  ) {
    super();
  }

  async getListingsFor(vehicle: Vehicle): Promise<Listing[]> {
    const request = new SearchRequest(
      this.location,
      vehicle,
      this.page,
      this.sortBy
    );

    const results: SearchResult[] =
      ((await (await http.get(request.url())).json()) as {
        records: SearchResult[];
      }).records || [];

    return pMap(
      results.map(r => r.vin),
      async (vin: string): Promise<Details> =>
        await (await http.get(new DetailRequest(vin).url())).json(),
      { concurrency: REQUEST_CONCURRENCY }
    ).then(details =>
      details.map(detail =>
        new ResultTransformer(this, vehicle, detail).toListing()
      )
    );
  }
}
