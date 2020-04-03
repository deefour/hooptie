<template lang="pug">
  font-awesome-icon(class="text-gray-500 opacity-50 mr-2 cursor-pointer hover:text-black" icon="trash" @click="toggle()" :class="{ trashed: isTrashed(listing) }")
</template>

<script lang="ts">
import Vue from "vue";
import { Listing, Decision } from "../types";
import { mapState, mapGetters } from "vuex";

export default Vue.extend({
  props: {
    listing: {
      type: Object as () => Listing,
      required: true,
    },
  },

  computed: {
    ...mapState(["user"]),
    ...mapGetters(["isTrashed"]),
  },

  methods: {
    toggle() {
      this.$store.dispatch("toggleTrashed", {
        vin: this.listing.vin,
        uid: this.user.uid,
      });
    },
  },
});
</script>

<style scoped>
.trashed {
  @apply opacity-100 text-black;
}
</style>
