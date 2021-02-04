import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Step from "../views/Step.vue";
// import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/step/:stepName/:order", component: Step },
  {
    path: "/home",
    component: Home,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
