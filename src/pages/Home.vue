<template lang="pug">
  div
    .listings
      h1  New Listings
      listing-summary(v-for="listing in listings" :key="listing.vin" :listing="listing")
</template>

<script lang="ts">
import Vue from "vue";
import ListingSummary from "../components/ListingSummary.vue";
import { Listing } from "../types";
import { mapState } from "vuex";

export default Vue.extend({
  computed: {
    ...mapState(["listings"])
  },

  components: {
    ListingSummary
  }
});
</script>

<style lang="scss">
//
</style>
