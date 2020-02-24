import "./app.css";
import "./icons";
import "babel-polyfill";
import bugsnag from "@bugsnag/js";
import bugsnagVue from "@bugsnag/plugin-vue";
import Vue from "vue";
import { isEmpty } from "lodash";

if (!isEmpty(process.env.BUGSNAG_API_KEY)) {
  const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY);

  bugsnagClient.use(bugsnagVue, Vue);
}

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
