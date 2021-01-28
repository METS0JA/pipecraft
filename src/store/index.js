import Vue from "vue";
import Vuex from "vuex";
var _ = require("lodash");

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    env_variables: ["FOO=bar", "BAZ=quux"],
    selectedSteps: [],
    steps: [
      {
        stepName: "demultiplex",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "remove adapters",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "quality filter",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "assemble paired-end",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "gene extraction",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "cluster",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
      {
        stepName: "assing taxonomy",
        order: null,
        route: "",
        services: [
          {
            mothur: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
            cutadapt: [
              {
                selected: false,
                description: "",
                inputs: [
                  { name: "param1", value: 10, tooltip: "yo" },
                  { name: "param2", value: 1, tooltip: "yo mees" },
                  { name: "param3", value: true, tooltip: "cya" },
                  { name: "param4", value: false, tooltip: "tere" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  mutations: {
    removeStep(state, index) {
      state.selectedSteps.splice(index, 1);
    },
    addStep(state, payload) {
      let step = _.cloneDeep(payload.step);
      console.log(payload.route);
      console.log(step);
      step.route = payload.route;
      state.selectedSteps.push(step);
    },
    DraggableUpdate(state, value) {
      state.selectedSteps = value;
    },
  },
  actions: {},
  modules: {},
});
