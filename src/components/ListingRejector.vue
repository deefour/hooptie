<template lang="pug">
  li(:title="rejector.description" @click="toggle()" :class="{ active: isActive }")
    font-awesome-icon(icon="check" class="icon")
    span(v-text="rejector.name")

</template>

<script lang="ts">
import Vue from "vue";
import { ListingRejector } from "../types";

export default Vue.extend({
  props: {
    rejector: {
      type: Object as () => ListingRejector,
      required: true,
    },
  },

  computed: {
    isActive(): boolean {
      return this.$store.state.rejectors.includes(this.rejector.id);
    },
  },

  methods: {
    toggle() {
      this.$store.commit("toggleRejector", this.rejector.id);
    },
  },
});
</script>

<style scoped>
li {
  @apply rounded-full bg-gray-200 py-1 px-3 cursor-pointer flex flex-row flex-no-wrap items-center whitespace-no-wrap mr-2 mb-2;

  .icon {
    @apply mr-2;
  }

  &:hover {
    @apply bg-gray-400;
  }

  &.active {
    @apply opacity-75 text-gray-800;

    .icon {
      @apply opacity-25;
    }
  }
}
</style>
