<template lang="pug">
  font-awesome-icon(class="text-gray-500 opacity-50 mr-2" icon="heart" @click="toggle()" :class="{ enabled: isEnabled, favorited: isFavorited(listing) }")
</template>

<script lang="ts">
import Vue from "vue";
import { Listing, Decision } from "../types";
import { mapGetters, mapState } from "vuex";

export default Vue.extend({
  props: {
    listing: {
      type: Object as () => Listing,
      required: true
    }
  },

  computed: {
    ...mapState(["user"]),
    ...mapGetters(["isAuthenticated", "isFavorited", "isTrashed"]),

    isEnabled(): boolean {
      return this.isAuthenticated && !this.isTrashed(this.listing);
    }
  },

  methods: {
    toggle() {
      if (!this.isEnabled) {
        return;
      }

      this.$store.dispatch("toggleFavorite", {
        vin: this.listing.vin,
        uid: this.user.uid
      });
    }
  }
});
</script>

<style scoped>
.enabled {
  @apply cursor-pointer;

  &:hover {
    @apply text-red-900;
  }
}
.favorited {
  @apply opacity-100 text-red-500;
}
</style>
