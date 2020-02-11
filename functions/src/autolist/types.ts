export interface SearchResult {
  vin: string;
}

export interface Details {
  make: string;
  model: string;
  price_unformatted: number | undefined;
  trim: string;
  vin: string;
  year: number;
  lat: number | undefined;
  lon: number | undefined;
  mileage: number | undefined;
  zip: string;
  photo_urls: string[];
  engine_type: string;
  transmission: string;
  exterior_color: string;
}
