import Location from "../Location";
import Service from "./Service";

export const MakeService = (location: Location) => new Service(location);
