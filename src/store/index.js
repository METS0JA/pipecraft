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
            serviceName: "mothur",
            selected: false,
            numericInputs: [
              { name: "mothur_param1", value: 1, tooltip: "yo" },
              { name: "mothur_param2", value: 2, tooltip: "yo mees" },
            ],
            booleanInputs: [
              { name: "mothur_param3", value: true, tooltip: "cya" },
              { name: "mothur_param4", value: true, tooltip: "tere" },
            ],
            selectInputs: [
              {
                name: "mothur_param5",
                value: ["16S", "ITS", "18S"],
                tooltip: "zzzZZzzZZZzzz",
              },
              {
                name: "mothur_param6",
                value: [
                  "Silva",
                  "Unite",
                  "GreenGenesGreenGenesGreenGenesGreenGenes",
                  "RDP",
                ],
                tooltip: "zzzZZzzZZZzzz",
              },
            ],
          },
          {
            serviceName: "cutadapt",
            selected: false,
            numericInputs: [
              { name: "cutadapt_param1", value: 3, tooltip: "yo" },
              { name: "cutadapt_param2", value: 4, tooltip: "yo mees" },
            ],
            booleanInputs: [
              { name: "cutadapt_param3", value: false, tooltip: "cya" },
              { name: "cutadapt_param4", value: false, tooltip: "tere" },
            ],
            selectInputs: [
              {
                name: "cutadapt_param5",
                value: ["16S", "ITS", "18S"],
                tooltip: "zzzZZzzZZZzzz",
              },
              {
                name: "cutadapt_param6",
                value: ["Silva", "Unite", "GreenGenes", "RDP"],
                tooltip: "zzzZZzzZZZzzz",
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
  getters: {},
  mutations: {
    removeStep(state, index) {
      state.selectedSteps.splice(index, 1);
    },
    addStep(state, payload) {
      let step = _.cloneDeep(payload.step);
      state.selectedSteps.push(step);
    },
    DraggableUpdate(state, value) {
      console.log(value);
      state.selectedSteps = value;
    },
    serviceInputUpdate(state, payload) {
      state.selectedSteps[payload.stepIndex].services[payload.serviceIndex] =
        payload.value;
    },
    checkService(state, payload) {
      for (
        let index = 0;
        index < state.selectedSteps[payload.stepIndex].services.length;
        index++
      ) {
        if (index === payload.serviceIndex) {
          state.selectedSteps[payload.stepIndex].services[index].selected =
            payload.selected;
        } else {
          state.selectedSteps[payload.stepIndex].services[
            index
          ].selected = false;
        }
      }
    },
  },
  actions: {},
  modules: {},
});
