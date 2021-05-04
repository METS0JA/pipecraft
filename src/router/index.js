import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import StepPrototype from "../views/StepPrototype.vue";
import dada2Miseq from "../views/dada2Miseq.vue";
// import About from "../views/About.vue";

Vue.use(VueRouter);

const routes = [
  { path: "/step/:stepName/:order", component: StepPrototype },
  {
    path: "/home",
    component: Home,
  },
  {
    path: "/premade/:workflowName",
    component: dada2Miseq,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
