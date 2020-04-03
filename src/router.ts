import Vue from "vue";
import VueRouter, { RouteConfig } from "vue-router";

import Home from "./pages/Home.vue";
import Login from "./pages/Login.vue";
import store from "./store";

Vue.use(VueRouter);

const routes: RouteConfig[] = [
  {
    path: "/logout",
    async beforeEnter(_, __, next) {
      await store.dispatch("signOut");
      next({ path: "/" });
    },
  },

  {
    path: "/",
    component: Home,
  },

  {
    path: "/login",
    component: Login,
    meta: { requiresAnonymous: true },
  },
];

const router = new VueRouter({
  mode: ["production"].includes((process.env.NODE_ENV || "local").toLowerCase())
    ? "history"
    : "hash",
  routes,
});

/**
 * Route guard to ensure the user has authenticated with firebase when a route
 * definition has meta indicating authentication is required.
 *
 * Unauthenticated users will be redirected back to the
 */
router.beforeEach((to, _, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    store.getters.isAnonymous
  ) {
    next({ path: "/login" });
  } else {
    next();
  }
});

/**
 * Route guard to ensure the user has authenticated with firebase when a route
 * definition has meta indicating authentication is required.
 *
 * Unauthenticated users will be redirected back to the
 */
router.beforeEach((to, _, next) => {
  if (
    to.matched.some((record) => record.meta.requiresAnonymous) &&
    store.getters.isAuthenticated
  ) {
    next({ path: "/" });
  } else {
    next();
  }
});

export default router;
