import Location from "../Location";
import Service from "./Service";
import { ServiceFactory } from "../types";

export const baseUrl = "https://www.autotrader.com";

export const MakeService: ServiceFactory = (location: Location) =>
  new Service(location);
