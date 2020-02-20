export interface Listing extends firebase.firestore.DocumentData {
  vin: string;
  title: string;
  distance: number | undefined;
}

export interface Decision {
  vin: string;
  uid: string;
}

export interface User {
  uid: string;
  email: string;
}

export interface RootState {
  listings: Listing[];
  user?: User;
  favorited: Decision[];
  trashed: Decision[];
  error?: Error;
  active?: string;
  rejectors: string[];
  vehicles: Vehicle[];
}

export interface UserSettings extends firebase.firestore.DocumentData {
  active: boolean;
}

export interface ListingRejector {
  id: string;
  name: string;
  description: string;
  filter: (listing: Listing) => boolean;
}

interface Trim {
  name: string;
}

interface AutoTraderCode {
  make: string;
  model: string;
}

export interface Vehicle {
  identifier: string;
  title: string;
  make: string;
  model: string;
  trims?: Trim[];
  min_mileage?: number;
  max_mileage?: number;
  min_year?: number;
  max_year?: number;
  min_price?: number;
  max_price?: number;
  cylinders?: number[];
  autotrader: AutoTraderCode;
  drivelines?: string[];
  description: string;
}
