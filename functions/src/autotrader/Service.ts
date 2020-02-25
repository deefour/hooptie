import { AbstractSearchService } from "../SearchService";
import Listing from "../Listing";
import Location from "../Location";
import ResultTransformer from "./ResultTransformer";
import SearchRequest from "./SearchRequest";
import { SearchResult } from "./types";
import Vehicle from "../Vehicle";
import http from "../http";

export default class Service extends AbstractSearchService {
  readonly identifier = "autotrader";
  readonly name = "AutoTrader";
  readonly priority = 10;
  protected page = 1;

  constructor(
    readonly location: Location,
    protected readonly recordsPerPage: number = 25,
    protected readonly sortBy: string = "mileageAsc"
  ) {
    super();
  }

  async getListingsFor(vehicle: Vehicle): Promise<Listing[]> {
    const request = new SearchRequest(
      this.location,
      vehicle,
      this.page,
      this.recordsPerPage,
      this.sortBy
    );

    const results: SearchResult[] =
      ((await (await http.get(request.url())).json()) as {
        listings: SearchResult[];
      }).listings || [];

    return results.map(result =>
      new ResultTransformer(this, vehicle, result).toListing()
    );
  }
}
