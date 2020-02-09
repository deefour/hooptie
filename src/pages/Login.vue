<template lang="pug">
  div
    h1 Account Login

    .field
      label Email Address
      input(type="email" v-model="credentials.email" :disabled="loading")

    .field
      label Password
      input(type="password" v-model="credentials.password" :disabled="loading")

    .controls
      button(type="button" @click="authenticate()" :disabled="loading") Login
      .loading(v-if="loading") Authenticating...

    .error(v-if="error" v-text="error")
</template>

<script lang="ts">
import Vue from "vue";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginComponentData {
  loading: boolean;
  error: string | null;
  credentials: LoginCredentials;
}

export default Vue.extend({
  data(): LoginComponentData {
    return {
      loading: false,
      error: null,
      credentials: {
        email: "",
        password: ""
      }
    };
  },

  methods: {
    isValid() {
      return !Object.values(this.credentials).some(v => v.trim().length === 0);
    },

    reset() {
      this.loading = false;
      this.error = null;
    },

    async authenticate() {
      this.reset();

      if (!this.isValid()) {
        this.error = "An email address and password are required to login.";

        return;
      }

      this.loading = true;

      try {
        const credentials = { ...this.credentials };

        this.credentials.password = "";

        await this.$store.dispatch("signIn", credentials);

        this.$router.push({ path: "/" });
      } catch (error) {
        this.error = `Login failed. ${error.message}`;
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>

<style lang="scss"></style>
