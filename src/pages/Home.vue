<template lang="pug">
  div
    loading-indicator.px-3(v-if="loading") Loading listings...
    .listings(v-else)
      p.no-listings(v-if="listings.length === 0") There is no listing data available for display.
      template(v-else)
        .rejectors
          strong Showing:
          ul
            listing-rejector.rejector(v-for="rejector in rejectors" :key="rejector.id" :rejector="rejector")
        p.no-listings(v-if="preparedListings.length === 0")
          span(v-if="allListingsHaveBeenReviewed") #[b All set!] There are no more listings to review.
          span(v-else) No listings match the applied filters.
        table.w-full(v-else)
          thead
            tr
              th
              th Miles
              th Price
              th Location
          tbody
            listing-summary(v-for="listing in preparedListings" :key="listing.vin" :listing="listing")
</template>

<script lang="ts">
import Vue from "vue";
import ListingSummary from "../components/ListingSummary.vue";
import { Listing } from "../types";
import { mapState, mapGetters } from "vuex";
import { firestore } from "firebase";
import { reject } from "lodash";
import rejectors from "../rejectors";
import ListingRejector from "../components/ListingRejector.vue";

export default Vue.extend({
  data() {
    return {
      rejectors
    };
  },

  computed: {
    ...mapState(["error", "listings"]),
    ...mapGetters([
      "hasListings",
      "isFavorited",
      "allListingsHaveBeenReviewed"
    ]),

    loading(): boolean {
      return !this.error && !this.hasListings;
    },

    preparedListings(): Listing[] {
      const activeRejectors = this.rejectors.filter(({ id }) =>
        this.$store.state.rejectors.includes(id)
      );

      // apply the rejectors
      const filteredListings = activeRejectors.reduce(
        (listings, rejector) => reject(listings, rejector.filter),
        this.listings
      );

      // push favorited listings to the top
      filteredListings.sort((a: Listing, b: Listing): number => {
        if (this.isFavorited(a)) {
          return -1;
        }

        if (this.isFavorited(b)) {
          return 1;
        }

        return 0;
      });

      return filteredListings;
    }
  },

  components: {
    ListingSummary,
    ListingRejector
  }
});
</script>

<style scoped>
th {
  @apply text-left bg-gray-100;
}

.rejectors {
  @apply flex flex-row flex-no-wrap items-start text-sm mx-2 mt-5 mb-3;

  strong {
    @apply py-1 hidden;
  }

  ul {
    @apply flex flex-row items-center flex-wrap;
  }

  @screen sm {
    strong {
      @apply block;
    }

    ul {
      @apply ml-3;
    }
  }
}

.no-listings {
  @apply mx-3;
}
</style>
