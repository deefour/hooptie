export interface Listing extends firebase.firestore.DocumentData {
  vin: string;
  title: string;
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
}

export interface UserSettings extends firebase.firestore.DocumentData {
  active: boolean;
}
