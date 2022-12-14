<template>
  <v-container fluid style="top: 30px; right: 0">
    <div
      @click="runDocker()"
      style="
        margin-right: 3px;
        overflow-y: scroll !important;
        min-width: 800px !important;
        min-height: 30% !important;
        height: 40% !important;
        background-color: #454442;
      "
      id="terminal_2"
    ></div>
    <div
      style="
        margin-right: 3px;
        min-width: 800px !important;
        background-color: #212121;
        color: white;
      "
    >
      <v-card>
        <v-card-text style="padding-bottom: 10px">
          <p style="margin-bottom: 0px">
            This is an automated test module for checking that all features work
            as intended. <br />
            Input data and parameters for this test are set automatically.
            <br />
            Depending on your hardware this might take up to 15 minute to run
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn text color="teal accent-4"> Run test </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-container>
</template>

<script>
import { pullImageAsync } from "dockerode-utils";
import { imageExists } from "dockerode-utils";
import os from "os";
import "xterm/css/xterm.css";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import * as Dockerode from "dockerode";
const fs = require("fs");
const streams = require("memory-streams");
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
      ASVs_workflow: [
        {
          serviceName: "ASV_reorient",
          scriptName: "reorient_paired_end_reads.sh",
          imageName: "pipecraft/reorient:1",
          Inputs: [
            {
              name: "mismatches",
              value: 1,
            },
            {
              name: "forward_primers",
              value: [],
            },
            {
              name: "reverse_primers",
              value: [],
            },
          ],
        },
        {
          tserviceName: "ASV_cut_primers",
          scriptName: "cut_primers_paired_end_reads.sh",
          imageName: "pipecraft/cutadapt:3.5",
          Inputs: [
            {
              name: "forward_primers",
              value: [],
            },
            {
              name: "reverse_primers",
              value: [],
            },
            {
              name: "mismatches",
              value: 1,
            },
            {
              name: "min_overlap",
              value: 21,
            },
            {
              name: "seqs_to_keep",
              value: "keep_all",
            },
            {
              name: "pair_filter",
              value: "both",
            },
            {
              name: "min_seq_length",
              value: 32,
            },
            {
              name: "no_indels",
              value: true,
            },
          ],
        },
        {
          serviceName: "ASV_quality_filtering",
          scriptName: "quality_filtering_paired_end_dada2.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "read_R1",
              value: ["_R1"],
            },
            {
              name: "read_R2",
              value: ["_R2"],
            },
            {
              name: "samp_ID",
              value: ["_"],
            },
            {
              name: "maxEE",
              value: 2,
            },
            {
              name: "maxN",
              value: 0,
            },
            {
              name: "minLen",
              value: 20,
            },
            {
              name: "truncQ",
              value: 2,
            },
            {
              name: "truncLen",
              value: 0,
            },
            {
              name: "truncLen_R2",
              value: 0,
            },
            {
              name: "maxLen",
              value: 9999,
            },
            {
              name: "minQ",
              value: 0,
            },
            {
              name: "matchIDs",
              value: true,
            },
          ],
        },
        {
          serviceName: "ASV_denoise",
          scriptName: "assemble_paired_end_data_dada2_wf.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "pool",
              value: "FALSE",
            },
            {
              name: "selfConsist",
              value: false,
            },
            {
              name: "qualityType",
              value: "Auto",
            },
          ],
        },
        {
          serviceName: "ASV_merge_pairs",
          scriptName: "assemble_paired_end_data_dada2_wf.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "minOverlap",
              value: 12,
            },
            {
              name: "maxMismatch",
              value: 0,
            },
            {
              name: "trimOverhang",
              value: false,
            },
            {
              name: "justConcatenate",
              value: false,
            },
          ],
        },
        {
          serviceName: "ASV_chimera_filtering",
          scriptName: "chimera_filtering_dada2_wf.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "method",
              value: "consensus",
            },
          ],
        },
        {
          serviceName: "ASV_filter_table",
          scriptName: "table_filtering_dada2_wf.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "collapseNoMismatch",
              value: true,
            },
            {
              name: "by_length",
              value: 250,
            },
            {
              name: "minOverlap",
              value: 20,
            },
            {
              name: "vec",
              value: true,
            },
          ],
        },

        {
          serviceName: "ASV_assign_taxonomy",
          scriptName: "taxonomy_dada2.sh",
          imageName: "pipecraft/dada2:1.20",
          Inputs: [
            {
              name: "dada2_database",
              value: "undefined",
            },
            {
              name: "minBoot",
              value: 50,
            },
            {
              name: "tryRC",
              value: false,
            },
          ],
        },
      ],
    };
  },
  created() {
    window.addEventListener("resize", this.myEventHandler);
  },
  destroyed() {
    window.removeEventListener("resize", this.myEventHandler);
  },
  mounted() {
    term.open(document.getElementById("terminal_2"));
    fitAddon.fit();
  },
  methods: {
    myEventHandler() {
      fitAddon.fit();
    },
    async runDocker(props, data) {
      let log = fs.createWriteStream("log.txt");
      for (let step of Object.entries(data)) {
        let stdout = new streams.WritableStream();
        await this.clearContainerConflicts(props.Hostname);
        await this.imageCheck(step.imageName);
        let promise = new Promise((resolve, reject) => {
          docker
            .run(
              step.imageName,
              ["sh", "-c", `/scripts/${step.scriptName}`],
              props,
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
    async imageCheck(imageName) {
      if (!(await imageExists(docker, imageName))) {
        await pullImageAsync(docker, imageName);
      }
    },
    async clearContainerConflicts(Hostname) {
      let container = await docker.getContainer(Hostname);
      await container.remove({ force: true });
    },
  },
};
</script>

<style></style>
