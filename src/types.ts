export interface Listing extends firebase.firestore.DocumentData {
  vin: string;
}

export interface User {
  uid: string;
  email: string;
}

export interface RootState {
  listings: Listing[];
  user?: User;
}

export interface UserSettings extends firebase.firestore.DocumentData {
  active: boolean;
}
