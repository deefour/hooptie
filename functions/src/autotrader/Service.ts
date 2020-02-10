import Listing from "../Listing";
import Location from "../Location";
import ResultTransformer from "./ResultTransformer";
import SearchRequest from "./SearchRequest";
import { SearchResult } from "./types";
import { SearchService } from "../types";
import Vehicle from "../Vehicle";
import axios from "axios";

export default class Service implements SearchService {
  readonly identifier = "autotrader";
  readonly name = "AutoTrader";
  readonly priority = 10;
  protected page = 1;

  constructor(
    readonly location: Location,
    protected readonly recordsPerPage: number = 25,
    protected readonly sortBy: string = "mileageAsc"
  ) {
    //
  }

  async getListings(vehicle: Vehicle): Promise<Listing[]> {
    const request = new SearchRequest(
      this.location,
      vehicle,
      this.page,
      this.recordsPerPage,
      this.sortBy
    );

    let results: SearchResult[] = [];

    try {
      results = (await axios.get(request.url().toString())).data.listings || [];
    } catch (error) {
      throw error;
    }

    return results.map(result =>
      new ResultTransformer(this, result).toListing()
    );
  }
}
