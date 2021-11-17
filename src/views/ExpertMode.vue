<template>
  <v-container pa-10 fluid>
    <div
      style="overflow-y:scroll!important; min-width:800px!important"
      id="terminal"
    ></div></v-container
></template>

<script>
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { ipcRenderer } from "electron";
const term = new Terminal({
  experimentalCharAtlas: "dynamic",
  theme: { background: "#454442" },
});
const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.onResize((size) => {
  ipcRenderer.send("terminalResize", size);
});

export default {
  created() {
    window.addEventListener("resize", this.myEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },
  data() {
    return {
      term: null,
    };
  },
  mounted() {
    console.log("entered");
    term.open(document.getElementById("terminal"));
    fitAddon.fit();
    term.onData((e) => {
      ipcRenderer.send("terminal.toTerm", e);
    });
    ipcRenderer.on("terminal.incData", function(event, data) {
      term.write(data);
    });
  },
  name: "ExperMode",
  components: {
    // SelectedRoutes,
  },

  computed: {},
  methods: {
    myEventHandler() {
      fitAddon.fit();
    },
  },
};
</script>

<style scoped></style>
