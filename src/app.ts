import App from "./components/App.vue";
import Vue from "vue";
import { firestore } from "./firebase";
import router from "./router";
import store from "./store";

Vue.config.productionTip = false;

Vue.prototype.$store = store;
Vue.prototype.$firestore = firestore;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
