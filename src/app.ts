import "./app.css";
import "./icons";
import "babel-polyfill";

import Vue from "vue";

import App from "./components/App.vue";
import LoadingIndicator from "./components/LoadingIndicator.vue";
import { firestore } from "./firebase";
import router from "./router";
import store from "./store";

import "./webpush";

Vue.config.productionTip = false;

Vue.prototype.$store = store;
Vue.prototype.$firestore = firestore;

Vue.component("loading-indicator", LoadingIndicator);

store.dispatch("boot");

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
