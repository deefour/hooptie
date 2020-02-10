import { Trim } from "./Vehicle";

export default class Listing {
  readonly vin: string;

  constructor(
    readonly service: string,
    readonly make: string,
    readonly model: string,
    protected readonly _title: string | undefined,
    readonly price: number | undefined,
    vin: string,
    readonly trim: Trim | undefined,
    readonly year: number,
    readonly url: URL,
    readonly zip_code: string | undefined,
    readonly engine: string | undefined,
    readonly transmission: string | undefined,
    readonly color: string | undefined,
    readonly mileage: number,
    readonly images: URL[]
  ) {
    this.vin = vin.toUpperCase();
  }

  title(): string {
    return this._title || `${this.year} ${this.make} ${this.model}`;
  }

  toJSON() {
    return {
      service: this.service,
      make: this.make,
      model: this.model,
      price: this.price,
      title: this.title(),
      vin: this.vin,
      year: this.year,
      url: this.url.toString(),
      zip_code: this.zip_code,
      engine: this.engine,
      mileage: this.mileage,
      transmission: this.transmission,
      trim: this.trim !== undefined ? this.trim.name : undefined,
      color: this.color,
      images: this.images.map(image => image.toString())
    };
  }
}
