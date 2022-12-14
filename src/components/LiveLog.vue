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
const fs = require("fs");
const streams = require("memory-streams");
var stdout = new streams.WritableStream();
// var stderr = new streams.WritableStream();

var socketPath =
  os.platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock";
var docker = new Dockerode({ socketPath: socketPath });

var term;
term = new Terminal({
  theme: { background: "#454442" },
  convertEol: true,
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
    async runDocker() {
      let log = fs.createWriteStream("log.txt");
      const object1 = {
        a: "Hyperion ",
        b: "Endymion",
        c: "Starship Troopers",
        d: "Ringworld",
        e: "Stranger in a Strange land",
        f: "Rendezvous with Rama",
      };
      for (let [i, step] of Object.entries(object1)) {
        stdout = new streams.WritableStream();
        let promise = new Promise((resolve, reject) => {
          docker
            .run(
              "ubuntu",
              [
                "sh",
                "-c",
                `for value in $(seq 1 5)
                 do
                   echo ${step} + ${i}
                   echo $value
                   sleep 5s
                 done
                 echo All done`,
              ],
              false,
              (err, data, container) => {
                console.log(container);
                console.log(data);
                console.log(stdout.toString());
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  resolve(data);
                }
              }
            )
            .on("stream", (stream) => {
              stream.on("data", function (data) {
                console.log(data.toString().replace(/[\n\r]/g, ""));
                log.write(data.toString().replace(/[\n\r]/g, ""));
                term.write(data.toString().replace(/[\n\r]/g, "") + "\n");
                stdout.write(data.toString().replace(/[\n\r]/g, "") + "\n");
              });
            });
        });
        let result = await promise;
        console.log(result);
        if (result.statusCode != 0) {
          break;
        }
        console.log("viimane lohh");
      }
    },
  },
};
</script>

<style></style>
