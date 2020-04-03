<template lang="pug">
  div.max-w-4xl
    header.flex.flex-row.justify-between.p-3.bg-gray-100
      h1
        router-link(to="/") Find My Hooptie
      ul.text-sm.font-semibold
        li(v-if="isAuthenticated")
          router-link(to="/logout") Logout
        li(v-else)
          router-link(to="/login") Login
    error-message
    main
      router-view
    footer.text-sm.opacity-75.p-3
      p Created by #[a(href="https://deefour.me") deefour]. Source code available on #[a(href="https://github.com/deefour/hooptie") Github]. UI hosted by #[a(href="https://netlify.com") Netlify]. Vehicle listing data stored in #[a(href="https://firebase.google.com/products/firestore/") Cloud Firestore].
</template>

<script lang="ts">
import Vue from "vue";
import firebase, { firestore } from "~/firebase";
import { Listing } from "../types";
import { mapGetters } from "vuex";
import ErrorMessage from "./ErrorMessage.vue";

export default Vue.extend({
  computed: {
    ...mapGetters(["isAuthenticated"]),
  },

  components: {
    ErrorMessage,
  },
});
</script>

<style scoped>
header,
footer {
  a {
    @apply text-gray-900 font-semibold underline;

    &:hover {
      @apply text-black;
    }
  }

  h1 a {
    @apply font-black no-underline;
  }
}

main {
  @apply my-2;
}
</style>
