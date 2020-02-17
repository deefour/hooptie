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
