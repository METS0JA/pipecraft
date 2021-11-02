import Vue from "vue";
import { sync } from "vuex-router-sync";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Sortable from "vue-sortable";
Vue.config.productionTip = false;
Vue.prototype.$test = 0;
sync(store, router);

new Vue({
  router,
  Sortable,
  store,
  vuetify,
  render: (h) => h(App),
  created() {
    // Prevent blank screen in Electron builds
    if (this.$route.path != "/home") {
      this.$router.push("/home");
    }
  },
}).$mount("#app");
