<template lang="pug">
  form.max-w-sm.px-3(@submit.prevent="authenticate()")
    h2 Account Login

    div.my-2
      label Email Address
      input(type="email" v-model="credentials.email" :disabled="loading" autofocus)

    div.my-2
      label Password
      input(type="password" v-model="credentials.password" :disabled="loading")

    .controls
      button(type="submit" :disabled="loading") Login
      loading-indicator(v-if="loading") Authenticating...
</template>

<script lang="ts">
import Vue from "vue";
import { mapState } from "vuex";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginComponentData {
  loading: boolean;
  credentials: LoginCredentials;
}

export default Vue.extend({
  data(): LoginComponentData {
    return {
      loading: false,
      credentials: {
        email: "",
        password: ""
      }
    };
  },

  mounted() {
    this.$nextTick(this.autofocus.bind(this));
  },

  watch: {
    error(newValue) {
      if (newValue !== undefined) {
        this.autofocus();
      }
    }
  },

  computed: {
    ...mapState(["error"])
  },

  methods: {
    autofocus() {
      this.$el.querySelector('input[type="email"]').focus();
    },

    isValid() {
      return !Object.values(this.credentials).some(v => v.trim().length === 0);
    },

    reset() {
      this.loading = false;
      this.$store.commit("setError");
    },

    async authenticate() {
      this.reset();

      if (!this.isValid()) {
        this.$store.commit(
          "setError",
          new Error("An email address and password are required to login.")
        );

        return;
      }

      this.loading = true;

      try {
        const credentials = { ...this.credentials };

        this.credentials.password = "";

        await this.$store.dispatch("signIn", credentials);

        this.$router.push({ path: "/" });
      } catch (error) {
        this.$store.commit(
          "setError",
          new Error(`Login failed. ${error.message}`)
        );
      } finally {
        this.loading = false;
      }
    }
  }
});
</script>
