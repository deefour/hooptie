import { RootState } from "~/types";

export default {
  user: undefined,
  listings: [],
  favorited: [],
  trashed: [],
  error: undefined,
  active: undefined,
  rejectors: ["trashed"],
  vehicles: [],
  page: 1
} as RootState;
