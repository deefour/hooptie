<template lang="pug">
  .loading-indicator
    slot Loading...
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  //
});
</script>

<style scoped>
.loading-indicator {
  @apply my-2 font-bold;
  animation: pulse 0p5s infinite ease-in-out;
}
</style>
