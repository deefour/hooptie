<template lang="pug">
  div
    .loading(v-if="loading") Fetching listing details for #[mark(v-text="incomingVIN")]...
    .error(v-if="error" v-text="error")
    .listing(v-if="listing")
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  data() {
    return {
      listing: null,
      error: null,
      loading: true
    };
  },

  computed: {
    incomingVIN(): string {
      return this.$route.params.vin.toUpperCase();
    }
  },
  watch: {
    $route: "fetchListing"
  },
  created() {
    this.fetchListing();
  },

  methods: {
    reset() {
      this.error = null;
      this.loading = true;
      this.listing = null;
    },

    async fetchListing() {
      this.reset();

      const vin = this.incomingVIN;
    }
  }
});
</script>

<style lang="scss">
//
</style>
