import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import vuetify from "./plugins/vuetify";
import Sortable from "vue-sortable";
Vue.config.productionTip = false;

new Vue({
  router,
  Sortable,
  store,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
