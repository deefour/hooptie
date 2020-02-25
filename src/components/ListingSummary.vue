<template lang="pug">
  tr.listing(:class="classes" @click="markActive()")
    td
      .flex.flex-row
        div.flex.flex-col
          favorite-toggle.mb-2(:listing="listing" @click.stop="")
          trash-toggle(:listing="listing" v-if="isAuthenticated" @click.stop="")
        div
          .flex.flex-row.items-center
            a(:href="listing.url" target="_blank" v-text="title")
            img.thumbnail(v-if="thumbnail" :src="thumbnail")
          ul.stats
            li(v-text="listing.service" class="hidden sm:inline-block")
            li(v-text="listing.year")
            li(v-if="listing.color" v-text="listing.color" class="hidden sm:inline-block")
            li
              a(:href="`https://www.google.com/search?q=${listing.vin}`" target="_blank")
                code.text-red-800(v-text="listing.vin")
            li.new-listing(v-if="isNew")
              font-awesome-icon.mr-1.opacity-75(icon="star")
              span New Listing!

    td
      span(v-if="mileage" v-text="mileage")
      i.unknown(v-else) Unknown
    td
      span.price(v-if="price" v-text="price")
      i.unknown(v-else) Unknown
    td.location-info
      .flex.flex-col
        a(v-if="listing.city" :href="`https://www.google.com/maps/@?api=1&map_action=map&center=${listing.location.latitude},${listing.location.longitude}&zoom=13`" target="_blank") {{ listing.city }}, {{ listing.state }}
        span.leading-none(v-else v-text="listing.zip_code")
        ul.stats(v-if="listing.city")
          li(v-if="milesAway" v-text="`${milesAway} miles`")
          li(v-text="listing.zip_code")
</template>

<script lang="ts">
import Vue from "vue";
import ActsAsListing from "../mixins/ActsAsListing";
import FavoriteToggle from "./FavoriteToggle.vue";
import TrashToggle from "./TrashToggle.vue";
import { mapGetters } from "vuex";

export default Vue.extend({
  mixins: [ActsAsListing],

  computed: {
    ...mapGetters(["isAuthenticated", "isFavorited", "isTrashed", "isActive"]),
    hasLocation() {
      return this.listing.location !== undefined;
    },

    classes(): object {
      return {
        favorited: this.isFavorited(this.listing),
        trashed: this.isTrashed(this.listing),
        new: this.isNew,
        active: this.isActive(this.listing)
      };
    },

    thumbnail(): string | undefined {
      return undefined;

      // return this.listing?.images?.[0];
    }
  },

  methods: {
    markActive() {
      this.$store.commit("setActive", this.listing.vin);
    }
  },

  components: {
    FavoriteToggle,
    TrashToggle
  }
});
</script>

<style scoped>
i.unknown {
  @apply not-italic text-xs text-gray-600;
}

.thumbnail {
  $size: 1rem;

  @apply rounded overflow-hidden ml-2;
  width: 1.25rem;
  height: 1.25rem;
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

.stats {
  @apply text-xs flex flex-row flex-wrap;

  li {
    @apply mr-2 whitespace-no-wrap;

    &:last-child {
      @apply mr-0;
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

  &.active {
    @apply bg-yellow-200;
  }

  .price {
    @apply text-green-600 font-semibold;
  }

  .new-listing {
    @apply font-bold text-pink-500 whitespace-no-wrap;
    animation: pulse 2s infinite ease-in-out;
  }
}
</style>
