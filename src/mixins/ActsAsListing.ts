import { Listing } from "~/types";

export default {
  props: {
    listing: {
      type: Object as () => Listing,
      required: true
    }
  },

  computed: {
    isNewListing() {
      return false;
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
};
