import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import StepPrototype from "../views/StepPrototype.vue";
import dada2Miseq from "../views/dada2Miseq.vue";
import RunInfo from "../views/RunInfo.vue";
import fastqcANDmultiqc from "../views/fastqcANDmultiqc.vue";
import ExpertMode from "../views/ExpertMode.vue";

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
  {
    path: "/RunInfo",
    component: RunInfo,
  },
  {
    path: "/fastqcANDmultiqc",
    component: fastqcANDmultiqc,
  },
  {
    path: "/ExpertMode",
    component: ExpertMode,
  },
];

const router = new VueRouter({
  routes,
});

export default router;
