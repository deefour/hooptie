import Home from "./pages/Home.vue";
import Listing from "./pages/Listing.vue";
import NotFound from "./pages/NotFound.vue";
import Vue from "vue";
import VueRouter from "vue-router";

Vue.use(VueRouter);

const routes = [
  { path: "/", component: Home },
  { path: "/listings/:vin", component: Listing },
  { path: "*", component: NotFound }
];

export default new VueRouter({
  mode: ["production"].includes((process.env.NODE_ENV || "local").toLowerCase())
    ? "history"
    : "hash",
  routes
});
