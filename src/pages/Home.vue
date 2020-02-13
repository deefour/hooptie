<template lang="pug">
  div
    loading-indicator(v-if="loading") Loading listings...
    .listings(v-else)
      p.no-listings(v-if="listings.length === 0") There is no listing data available for display.
      table.w-full(v-else)
        thead
          tr
            th
            th Miles
            th Price
            th Location
        tbody
          listing-summary(v-for="listing in listings" :key="listing.vin" :listing="listing")
</template>

<script lang="ts">
import Vue from "vue";
import ListingSummary from "../components/ListingSummary.vue";
import { Listing } from "../types";
import { mapState, mapGetters } from "vuex";
import { firestore } from "firebase";

export default Vue.extend({
  computed: {
    ...mapState(["listings", "error"]),
    ...mapGetters(["hasListings"]),

    loading(): boolean {
      return !this.error && !this.hasListings;
    }
  },

  components: {
    ListingSummary
  }
});
</script>

<style scoped>
th {
  @apply text-left;
}
</style>
