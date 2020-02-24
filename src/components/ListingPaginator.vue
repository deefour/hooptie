<template lang="pug">
  div.pagination
    div(v-if="totalPages > 1")
      strong(class="hidden sm:inline") Page:
      ul
        li(v-for="page in totalPages" v-text="page" @click="goToPage(page)" :class="{ current: isCurrentPage(page) }")

    p Showing listings #[b(v-text="first")] through #[b(v-text="last")] of #[b(v-text="totalListings")]
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapState } from "vuex";
import { LISTINGS_PER_PAGE } from "../constants";

export default Vue.extend({
  computed: {
    ...mapState({
      currentPage: "page"
    }),
    ...mapGetters(["filteredListings", "totalPages"]),

    totalListings() {
      return this.filteredListings.length;
    },

    first(): number {
      return (this.currentPage - 1) * LISTINGS_PER_PAGE + 1;
    },

    last(): number {
      return Math.min(this.totalListings, this.first + LISTINGS_PER_PAGE - 1);
    }
  },

  methods: {
    goToPage(page: number = 1): void {
      this.$store.commit("setPage", page);
    },

    isCurrentPage(page: number): boolean {
      return this.currentPage === page;
    }
  }
});
</script>

<style scoped>
.pagination {
  @apply flex justify-between flex-col-reverse text-sm;

  p {
    order: 1;
  }

  div {
    @apply flex items-center flex-row;

    order: 2;
  }

  ul {
    @apply flex flex-row items-center my-2;

    li {
      @apply cursor-pointer mr-2 rounded bg-gray-200 p-2 leading-none font-semibold;

      &:hover {
        @apply bg-gray-300;
      }

      &:last-child {
        @apply mr-0;
      }

      &.current {
        @apply bg-blue-500 text-white;
      }
    }
  }

  @screen sm {
    @apply flex-row-reverse items-center;

    ul {
      @apply mx-3;
    }
  }
}
</style>
