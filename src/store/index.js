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
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "remove adapters",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "quality filter",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "assemble paired-end",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "gene extraction",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "cluster",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
      {
        stepName: "assing taxonomy",
        order: null,
        numericInputs: [
          { name: "param1", value: 10, tooltip: "yo" },
          { name: "param2", value: 1, tooltip: "yo mees" },
        ],
        binaryInputs: [
          { name: "param3", value: true, tooltip: "cya" },
          { name: "param4", value: false, tooltip: "tere" },
        ],
        fileInputs: [
          {
            name: "param5",
            filepath: "example/exmaple/primers.fasta",
            tooltip: "some file plz",
          },
          {
            name: "param6",
            filepath: "example/another/database.fastq",
            tooltip: "yo mees",
          },
        ],
      },
    ],
  },
  mutations: {
    removeStep(state) {
      state.test1.push("Kiwi");
    },
    addStep(state, payload) {
      let step = _.cloneDeep(payload.step);
      // console.log(payload.order);
      // console.log(step);
      step.order = payload.order;
      state.selectedSteps.push(step);
    },
  },
  actions: {},
  modules: {},
});
