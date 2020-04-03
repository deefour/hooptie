<template lang="pug">
  .error-message(v-if="error")
    p #[b Error:] {{ error.message || 'An unexpected error occurred. Try again later.' }}
    font-awesome-icon.close(icon="times" @click="close()")
</template>

<script lang="ts">
import Vue from "vue";
import { mapGetters, mapState } from "vuex";

export default Vue.extend({
  computed: {
    ...mapState(["error"]),
  },
  methods: {
    close() {
      this.$store.commit("setError");
    },
  },
});
</script>

<style scoped>
.error-message {
  @apply bg-red-800 text-white font-semibold flex flex-row justify-between items-start p-3 text-sm;

  .close {
    @apply opacity-75 cursor-pointer ml-3;

    &:hover {
      @apply opacity-100;
    }
  }

  b {
    @apply font-black;
  }
}
</style>
