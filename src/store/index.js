import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    env_variables: ["FOO=bar", "BAZ=quux"],
    icon: "mdi-docker",
    test1: [],
    leftNav: [
      { title: "Home", icon: "mdi-view-dashboard" },
      { title: "About", icon: "mdi-forum" },
    ],
    selectedSteps: [
      {
        stepName: "x",
        serviceName: "y",
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
        stepName: "x",
        serviceName: "y",
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
        stepName: "x",
        serviceName: "y",
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
        stepName: "x",
        serviceName: "y",
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
        stepName: "x",
        serviceName: "y",
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
        stepName: "x",
        serviceName: "y",
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
        stepName: "z",
        serviceName: "y",
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
    qualityFilter: {
      selected: "",
      services: [
        {
          name: "vsearch",
          selected: false,
          numericInputs: [
            { title: "fastq_maxee", tooltip: "tere", value: 1 },
            { title: "fastq_maxns", tooltip: "tere", value: 1 },
            { title: "fastq_minlen", tooltip: "tere", value: 1 },
            { title: "fastq_maxlen", tooltip: "tere", value: 1 },
            { title: "fastq_truncqual", tooltip: "tere", value: 1 },
            { title: "fastq_maxee_rate", tooltip: "tere", value: 1 },
            { title: "fastq_qmin", tooltip: "tere", value: 1 },
          ],
        },
        {
          name: "mothur",
          selected: false,
          numericInputs: [
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
          ],
        },
        {
          name: "dada2",
          selected: false,
          numericInputs: [
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
          ],
        },
        {
          name: "userach",
          selected: false,
          numericInputs: [
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
          ],
        },
        {
          name: "trimmomatic",
          selected: false,
          numericInputs: [
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
            { title: "", tooltip: "", value: 1 },
          ],
        },
      ],
    },
  },
  mutations: {},
  actions: {},
  modules: {},
});
