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

export default class Vehicle {
  constructor(
    readonly drivelines: string[],
    readonly cylinders: number[],
    readonly make: string,
    readonly model: string,
    readonly max_mileage: number,
    readonly min_price: number,
    readonly max_price: number,
    readonly radius: number,
    readonly trims: Trim[],
    readonly min_year: number,
    readonly max_year: number,
    readonly autotrader: AutoTraderCode
  ) {
    this.drivelines = drivelines.map(d => d.trim().toLowerCase());
  }
}
