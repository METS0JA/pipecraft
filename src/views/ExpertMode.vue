<template>
  <v-container pa-10 fluid>
    <div
      style="overflow-y:scroll!important; min-width:800px!important"
      id="terminal"
    ></div></v-container
></template>

<script>
const pty = require("@electron/remote").require("node-pty");
import os from "os";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
var term;
var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
var ptyProc = pty.spawn(shell, [], {
  name: "xterm-color",
});
term = new Terminal({
  theme: { background: "#454442" },
  rows: 35,
  experimentalCharAtlas: "dynamic",
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.onData((data) => {
  ptyProc.write(data);
});
ptyProc.on("data", function(data) {
  term.write(data);
});
term.onResize((size) => {
  ptyProc.resize(
    Math.max(size ? size.cols : term.cols, 1),
    Math.max(size ? size.rows : term.rows, 1),
  );
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
    term.open(document.getElementById("terminal"));
    fitAddon.fit();
  },
  beforeDestroy() {},
  name: "ExperMode",
  components: {
    // SelectedRoutes,
  },
  methods: {
    myEventHandler() {
      fitAddon.fit();
    },
  },
};
</script>

<style scoped></style>
