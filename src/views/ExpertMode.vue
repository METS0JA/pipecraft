<template>
  <v-container pa-10 fluid>
    <div
      style="
        overflow-y: scroll !important;
        min-width: 800px !important;
        min-height: 60% !important;
        background-color: #454442
      "
      id="terminal"
    ></div>
  <div style="
        min-width: 800px !important; background-color: #212121; color:white" >
    <div style="padding: 6px">All bioinformatic tools used by pipecraft are available as docker images and can be used via dockers CLI.</div>
    <div style="padding: 6px">Check them out on dockerhub: <a href="https://hub.docker.com/u/pipecraft" target="_blank">https://hub.docker.com/u/pipecraft</a></div>
    <div style="padding: 6px">Some examples for using pipecrafts images with docker CLI are shown below</div>
    <v-divider style="background-color:white"></v-divider>
    <div style="padding: 6px">docker pull pipecraft/dada2:1.20</div>
    <div style="padding: 6px">docker run --interactive --tty -v C:\Users\Name\MyFiles\:/MyFilesOnContainer pipecraft/dada2:1.20</div>
    <v-divider style="background-color:white"></v-divider>
    <div style="padding: 6px">Check out the <a href="https://docs.docker.com/engine/reference/commandline/run/" target="_blank">Docker documentation</a> for more info</div>
  </div>
  </v-container>
</template>

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
ptyProc.on("data", function (data) {
  term.write(data);
});
term.onResize((size) => {
  ptyProc.resize(
    Math.max(size ? size.cols : term.cols, 1),
    Math.max(size ? size.rows : term.rows, 1)
  );
    fitAddon.fit();
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
