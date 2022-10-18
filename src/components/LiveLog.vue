<template>
  <v-container fluid style="position: absolute; bottom: 40px; right: 0">
    <div
      @click="runDocker()"
      v-show="toggle"
      style="
        margin-right: 3px;
        overflow-y: scroll !important;
        min-width: 800px !important;
        min-height: 40% !important;
        height: 60% !important;
        background-color: #454442;
      "
      id="terminal"
    ></div>
    <v-btn
      class="mx-0 my-2"
      absolute
      right
      @click="toggle = !toggle"
      outlined
      color="grey-darken-4"
      >Show live logs</v-btn
    >
  </v-container>
</template>

<script>
import os from "os";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import * as Dockerode from "dockerode";
const streams = require("memory-streams");
var stdout = new streams.WritableStream();

stdout.on("pipe", (src) => {
  console.log("Something is piping into the writer.");
  console.log(src.toString("utf8"));
});
var socketPath =
  os.platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock";
var docker = new Dockerode({ socketPath: socketPath });

var term;
term = new Terminal({
  theme: { background: "#454442" },
  rows: 35,
  experimentalCharAtlas: "dynamic",
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.onResize(() => {
  fitAddon.fit();
});

export default {
  name: "LiveLog",
  data() {
    return {
      toggle: false,
    };
  },
  created() {
    window.addEventListener("resize", this.myEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },
  mounted() {
    term.open(document.getElementById("terminal"));
    fitAddon.fit();
  },
  methods: {
    myEventHandler() {
      fitAddon.fit();
    },
    runDocker() {
      console.log("starting");
      // var stdout = new streams.WritableStream();
      docker
        .run(
          "ubuntu",
          ["sh", "-c", `watch -n1  echo "Hello"`],
          false,
          {
            Hostconfig: {
              Binds: ["C:/Users/martin/Desktop/test:/input"],
            },
          },
          {},
          (err, data, container) => {
            if (err) throw err;
            console.log(data.StatusCode);
            console.log(container);
          }
        )
        .on("container", (container) => {
          setTimeout(() => {
            console.log(container);
          }, 5000);
        })
        .on("stream", (stream) => {
          stream.on("data", (data) =>
            console.log(data.toString().replace(/[\n\r]/g, ""))
          );
        })
        .on("data", (data) => {
          console.log("data", data);
        });
    },
    runDocker_2() {
      console.log("starting");
      // var stdout = new streams.WritableStream();
      docker
        .run(
          "ubuntu",
          ["sh", "-c", `watch -n1  echo "Hello"`],
          false,
          {
            Hostconfig: {
              Binds: ["C:/Users/martin/Desktop/test:/input"],
            },
          },
          {},
          (err, data, container) => {
            if (err) throw err;
            console.log(data.StatusCode);
            console.log(container);
          }
        )
        .on("container", (container) => {
          setTimeout(() => {
            console.log(container);
          }, 5000);
        })
        .on("stream", (stream) => {
          stream.on("data", (data) =>
            console.log(data.toString().replace(/[\n\r]/g, ""))
          );
        })
        .on("data", (data) => {
          console.log("data", data);
        });
    },
  },
};
</script>

<style></style>
