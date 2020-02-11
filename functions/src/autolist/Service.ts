import { Details, SearchResult } from "./types";

import { AbstractSearchService } from "../SearchService";
import DetailRequest from "./DetailRequest";
import Listing from "../Listing";
import Location from "../Location";
import ResultTransformer from "./ResultTransformer";
import SearchRequest from "./SearchRequest";
import Vehicle from "../Vehicle";
import axios from "axios";

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

    let results: SearchResult[] = [];

    try {
      results = (await axios.get(request.url().toString())).data.records || [];
    } catch (error) {
      throw error;
    }

    return Promise.all(
      results.map(result =>
        axios
          .get(new DetailRequest(result.vin).url().toString())
          .then(response => response.data as Details)
      )
    ).then(details =>
      details.map(detail => new ResultTransformer(this, detail).toListing())
    );
  }
}
