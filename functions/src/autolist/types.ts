export interface SearchResult {
  vin: string;
}

export interface Details {
  make: string;
  model: string;
  price: number;
  trim: string;
  vin: string;
  year: number;
  mileage: number;
  zip: string;
  photo_urls: string[];
  engine_type: string;
  transmission: string;
  exterior_color: string;
}
