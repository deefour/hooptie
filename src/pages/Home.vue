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
              th Mileage
              th Price
              th Location
          tfoot
            tr
              td(colspan="4")
                <listing-paginator></listing-paginator>
          tbody
            listing-summary(v-for="listing in preparedListings" :key="listing.vin" :listing="listing")
</template>

<script lang="ts">
import Vue from "vue";
import ListingSummary from "../components/ListingSummary.vue";
import ListingPaginator from "../components/ListingPaginator.vue";
import { Listing, ListingRejector as Rejector } from "../types";
import { mapState, mapGetters } from "vuex";
import { firestore } from "firebase";
import { reject } from "lodash";
import ListingRejector from "../components/ListingRejector.vue";

export default Vue.extend({
  watch: {
    /**
     * Whenever the listings being displayed in the table changes, ensure the
     * current page is not suddenly 'out of bounds'.
     *
     * For example, if the user is on page 5 and toggles a rejector that causes
     * the total number of results to only fill 2 pages, the 'current page' should
     * be reset back to the page 1.
     */
    totalPages(newValue) {
      if (this.currentPage > newValue) {
        this.$store.commit("setPage", 1);
      }
    },
  },

  computed: {
    ...mapState(["error", "listings"]),
    ...mapState({
      currentPage: "page",
    }),
    ...mapGetters([
      "totalPages",
      "hasListings",
      "isFavorited",
      "allListingsHaveBeenReviewed",
      "rejectors",
      "pageOfListings",
    ]),

    loading(): boolean {
      return !this.error && !this.hasListings;
    },

    preparedListings(): Listing[] {
      return this.pageOfListings.sort((a: Listing, b: Listing): number => {
        if (this.isFavorited(a)) {
          return -1;
        }

        if (this.isFavorited(b)) {
          return 1;
        }

        return 0;
      });
    },
  },

  components: {
    ListingSummary,
    ListingRejector,
    ListingPaginator,
  },
});
</script>

<style scoped>
th {
  @apply text-left bg-gray-100;
}

.rejectors {
  @apply flex flex-row flex-no-wrap items-start text-sm mx-3 mt-5 mb-3;

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
