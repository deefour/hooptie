export interface SearchResult {
  make: string;
  model: string;
  pricingDetail?: {
    primary: number;
  };
  vin: string;
  title: string;
  trim: string;
  year: number;
  website: {
    href: string;
  };
  zip?: string;
  specifications: {
    engine?: {
      value: string;
    };
    transmission?: {
      value: string;
    };
    color?: {
      value: string;
    };
    mileage: {
      value: number;
    };
  };
  images?: {
    sources: {
      src: string;
    }[];
  };
}
