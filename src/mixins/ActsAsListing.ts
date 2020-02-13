import Vue from "vue";
import { Listing } from "~/types";

// # of milliseconds in a single day
const DAY_IN_MS = 24 * 60 * 60 * 1000;

// number of days to consider a listing 'new'
const DAYS_TO_OLD = 3;

export default Vue.extend({
  props: {
    listing: {
      type: Object as () => Listing,
      required: true
    }
  },

  computed: {
    /**
     * A listing is considered new if it is < 3 days old (based on it's created_at attribute) and NOT trashed or rejected.
     *
     * @return boolean
     */
    isNew(): boolean {
      const threshold = new Date().getTime() - DAYS_TO_OLD * DAY_IN_MS;
      console.log(this.listing);
      return this.listing.created_at.toDate().getTime() >= threshold;
    },

    title(): string {
      return this.listing.title;
    },

    mileage(): string | undefined {
      const mileage = Number(this.listing.mileage);

      if (mileage > 0) {
        return Intl.NumberFormat("en-US", { style: "decimal" }).format(mileage);
      }

      return undefined;
    },

    price(): string | undefined {
      const price = Number(this.listing.price);

      if (price > 0) {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD"
        })
          .format(price)
          .replace(/\.\d+$/, "");
      }

      return undefined;
    },

    location() {},

    favorited(): boolean {
      return false;
    }
  }
});
