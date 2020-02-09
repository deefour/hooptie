<template lang="pug">
  div
    header
      h1 Find My Hooptie
      ul
        li(v-if="isAuthenticated")
          router-link(to="/logout") Logout
    router-view
</template>

<script lang="ts">
import Vue from "vue";
import firebase, { firestore } from "~/firebase";
import { Listing } from "../types";
import { mapGetters } from "vuex";

export default Vue.extend({
  computed: {
    ...mapGetters(["isAuthenticated"])
  }
});
</script>

<style lang="scss">
//
</style>
