import Location from "../Location";
export Service from "./Service";

export const baseUrl = "https://www.autolist.com";

export const MakeService = (location: Location) => new Service(location);
