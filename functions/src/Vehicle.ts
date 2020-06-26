import * as admin from "firebase-admin";

export class AutoTraderCode {
  constructor(readonly make: string, readonly model: string) {
    //
  }
}

export class Trim {
  constructor(readonly name: string) {
    //
  }
}

// A vehicle describes a search to be performed against a search service, setting
// the bounds/criteria of the search.
export default class Vehicle {
  constructor(
    readonly identifier: string,
    readonly make: string,
    readonly model: string,
    readonly trims: Trim[],
    readonly max_mileage: number | undefined,
    readonly min_price: number | undefined,
    readonly max_price: number | undefined,
    readonly radius: number | undefined,
    readonly min_year: number | undefined,
    readonly max_year: number | undefined,
    readonly drivelines: string[],
    readonly cylinders: number[],
    readonly autotrader: AutoTraderCode
  ) {
    this.drivelines = drivelines.map((d) => d.trim().toLowerCase());
  }
}

const transformDocumentDataToVehicle = (data: VehicleData): Vehicle => {
  const trims = (data.trims || []).map((t) => new Trim(t));

  const autoTraderCode = new AutoTraderCode(
    data.autotrader.make,
    data.autotrader.model
  );

  return new Vehicle(
    data.identifier,
    data.make,
    data.model,
    trims,
    data.max_mileage,
    data.min_price,
    data.max_price,
    data.radius,
    data.min_year,
    data.max_year,
    data.drivelines || [],
    data.cylinders || [],
    autoTraderCode
  );
};

// getVehicles asynchronously fetches ACTIVE vehicle data from the Cloud Firestore,
// returning an array of Vehicle instances for use in search services.
export const getVehicles = async (): Promise<Vehicle[]> => {
  const collection = await admin
    .firestore()
    .collection("vehicles")
    .where("active", "==", true)
    .get();

  if (!collection.size) {
    throw new Error("No vehicles exist in the [vehicles] collection.");
  }

  const vehicles: Vehicle[] = [];

  collection.forEach((doc) =>
    vehicles.push(transformDocumentDataToVehicle(doc.data() as VehicleData))
  );

  return vehicles;
};

interface VehicleData extends admin.firestore.DocumentData {
  make: string;
  model: string;
  autotrader: {
    make: string;
    model: string;
  };
  drivelines?: string[];
  trims?: string[];
  cylinders?: number[];
  max_mileage: number;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  radius?: number;
}
