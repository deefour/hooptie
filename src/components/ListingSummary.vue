<template lang="pug">
  tr.listing(:class="{ trashed: isTrashed(listing), favorited: isFavorited(listing) }")
    td
      .flex.flex-row
        div.flex.flex-col
          favorite-toggle.mb-2(:listing="listing")
          trash-toggle(:listing="listing" v-if="isAuthenticated")
        div
          a(:href="listing.url" target="_blank" v-text="title")
          ul.text-xs.flex.flex-row
            li.pr-2(v-text="listing.service")
            li.pr-2(v-text="listing.year")
            li.pr-2(v-if="listing.color" v-text="listing.color")
            li
              code.text-red-800(v-text="listing.vin")
            li.new-listing.ml-2(v-if="isNewListing") New Listing!

    td.mileage(v-text="mileage")
    td.price(v-text="price")
    td(v-text="listing.zip_code")
</template>

<script lang="ts">
import Vue from "vue";
import ActsAsListing from "../mixins/ActsAsListing";
import FavoriteToggle from "./FavoriteToggle";
import TrashToggle from "./TrashToggle";
import { mapGetters } from "vuex";

export default Vue.extend({
  mixins: [ActsAsListing],

  computed: {
    ...mapGetters(["isAuthenticated", "isTrashed", "isFavorited"])
  },

  components: {
    FavoriteToggle,
    TrashToggle
  }
});
</script>

<style scoped>
td,
th {
  @apply py-1 px-3 text-left;
}

tbody {
  tr:nth-child(even) {
    @apply bg-gray-100;
  }

  tr:hover {
    @apply bg-yellow-100;
  }
}

a {
  @apply text-blue-700;

  &:hover {
    @apply text-blue-900;
  }

  &:visited {
    @apply text-purple-700;

    &:hover {
      @apply text-purple-800;
    }
  }
}

.listing {
  &.trashed {
    @apply opacity-50 line-through;
  }

  &.favorited {
    @apply bg-blue-100;
  }

  .price {
    @apply text-green-600 font-semibold;
  }

  .new-listing {
    @apply font-bold text-pink-500;
    animation: pulse 2s infinite ease-in-out;
  }
}
</style>
