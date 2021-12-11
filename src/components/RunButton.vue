<template>
  <v-tooltip
    right
    :disabled="
      $store.state.dockerStatus == 'running' &&
      $store.state.inputDir != '' &&
      (('workflowName' in $route.params &&
        $store.getters.customWorkflowReady) ||
        $store.getters.selectedStepsReady)
    "
  >
    <template v-slot:activator="{ on }">
      <div v-on="on">
        <v-btn
          style="background-color: #212121"
          :disabled="
            $store.state.dockerStatus == 'stopped' ||
            $store.state.inputDir == '' ||
            (!('workflowName' in $route.params) &&
              !$store.getters.selectedStepsReady) ||
            ('workflowName' in $route.params &&
              !$store.getters.customWorkflowReady)
          "
          block
          :style="
            $store.state.dockerStatus == 'stopped' ||
            $store.state.inputDir == '' ||
            (!('workflowName' in $route.params) &&
              !$store.getters.selectedStepsReady) ||
            ('workflowName' in $route.params &&
              !$store.getters.customWorkflowReady)
              ? {
                  borderBottom: 'thin #E57373 solid',
                  borderTop: 'thin white solid',
                  borderRight: 'thin white solid',
                  borderLeft: 'thin white solid',
                }
              : {
                  borderBottom: 'thin #1DE9B6 solid',
                  borderTop: 'thin white solid',
                  borderLeft: 'thin white solid',
                  borderRight: 'thin white solid',
                }
          "
          @click="
            $route.params.workflowName
              ? runCustomWorkFlow($route.params.workflowName)
              : runWorkFlow()
          "
        >
          Run workflow
        </v-btn>
      </div>
    </template>
    <div v-if="this.$store.state.dockerStatus == 'stopped'">
      Failed to find docker desktop!
    </div>
    <div v-if="this.$store.state.inputDir == ''">No files selected!</div>
    <div
      v-if="
        !$store.getters.selectedStepsReady &&
        $route.params.workflowName == undefined
      "
    >
      Missing selected services or mandatory inputs
    </div>
    <div
      v-if="
        'workflowName' in $route.params && !$store.getters.customWorkflowReady
      "
    >
      Missing mandatory inputs
    </div>
  </v-tooltip>
</template>

<script>
const path = require("path");
const slash = require("slash");
const Swal = require("sweetalert2");
const streams = require("memory-streams");
import * as Dockerode from "dockerode";
import { pullImageAsync } from "dockerode-utils";
import { imageExists } from "dockerode-utils";
import { ipcRenderer } from "electron";
import { mapState } from "vuex";
import { stringify } from "envfile";
import os from "os";
var socketPath =
  os.platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock";
var dockerode = new Dockerode({ socketPath: socketPath });
var stdout = new streams.WritableStream();
var stderr = new streams.WritableStream();
const isDevelopment = process.env.NODE_ENV !== "production";

export default {
  name: "Run",
  computed: mapState({
    selectedSteps: (state) => state.selectedSteps,
  }),
  data: () => ({
    items: [],
  }),
  methods: {
    async runCustomWorkFlow(name) {
      Swal.fire({
        title: `Run ${name.replace(/_/g, " ")}?`,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Continue",
      }).then(async (result) => {
        if (result.isConfirmed) {
          console.log(name);
          this.$store.commit("addWorkingDir", "/input");
          let startTime = Date.now();
          console.log(startTime);
          for (let index of this.$store.state[name].entries()) {
            if (
              this.$store.state[name][index[0]].selected == true ||
              this.$store.state[name][index[0]].selected == "always"
            ) {
              console.log(
                `Startin step ${index[0] + 1}: ${index[1].serviceName}`
              );
              let Hostname = index[1].serviceName.replace(" ", "_");
              console.log(Hostname);
              this.$store.commit("addRunInfo", [
                true,
                "customWorkflow",
                index[0],
                this.$store.state[name].length,
                Hostname,
              ]);
              let scriptName = this.$store.state[name][index[0]].scriptName;
              let imageName = this.$store.state[name][index[0]].imageName;
              let Input = this.$store.state.inputDir;
              let WorkingDir = this.$store.state.workingDir;
              let envVariables;
              envVariables = this.createCustomVariableObj(name, index[0]);
              let Binds = this.createCustomBinds(name, index[0], Input);
              console.log(Binds);
              let gotImg = await imageExists(dockerode, imageName);
              if (gotImg === false) {
                this.$store.commit("activatePullLoader");
                console.log(`Pulling image ${imageName}`);
                let output = await pullImageAsync(dockerode, imageName);
                console.log(output);
                console.log(`Pull complete`);
                this.$store.commit("deactivatePullLoader");
              }
              console.log(
                `SCRIPT: ${scriptName}`,
                "\n",
                `IMAGE: ${imageName}`,
                "\n",
                `INPUT: ${Input}`,
                "\n",
                `WORKDIR: ${WorkingDir}`
              );
              console.log(envVariables);
              let result = await dockerode
                .run(
                  imageName,
                  ["sh", "-c", `/scripts/${scriptName}`],
                  [stdout, stderr],
                  {
                    Tty: false,
                    WorkingDir: WorkingDir,
                    name: Hostname,
                    Volumes: {},
                    HostConfig: {
                      Binds: Binds,
                      // CpuCount: 6,
                    },
                    Env: envVariables,
                  }
                )
                .then(async ([res, container]) => {
                  console.log(stdout.toString());
                  let resObj = {};
                  resObj.statusCode = res.StatusCode;
                  container.remove();
                  if (res.StatusCode === 0) {
                    resObj.log = stdout.toString();
                    return resObj;
                  } else {
                    resObj.log = stderr.toString();
                    return resObj;
                  }
                })
                .catch((err) => {
                  this.$store.commit("resetRunInfo");
                  let resObj = {};
                  resObj.statusCode = err.statusCode;
                  resObj.log = err.json.message;
                  return resObj;
                });
              console.log(result);
              if (result.statusCode == 0) {
                let newWorkingDir = this.getVariableFromLog(
                  result.log,
                  "workingDir"
                );
                let newDataInfo = {
                  dataFormat: this.getVariableFromLog(result.log, "dataFormat"),
                  fileFormat: this.getVariableFromLog(result.log, "fileFormat"),
                  readType: this.getVariableFromLog(result.log, "readType"),
                };
                this.$store.commit(
                  "toggle_PE_SE_scripts",
                  newDataInfo.readType
                );
                this.$store.commit("addInputInfo", newDataInfo);
                this.$store.commit("addWorkingDir", newWorkingDir);
              } else {
                if (result.statusCode == 137 && result.log == "") {
                  Swal.fire("Workflow stopped");
                } else {
                  Swal.fire(result.log);
                }
                this.$store.commit("resetRunInfo");
                stdout = new streams.WritableStream();
                stderr = new streams.WritableStream();
                break;
              }
              stdout = new streams.WritableStream();
              stderr = new streams.WritableStream();
              console.log(
                `Finished step ${index[0] + 1}: ${index[1].serviceName}`
              );
              this.$store.commit("resetRunInfo");
              if (
                this.$store.state[name].length == index[0] + 1 &&
                result.statusCode == 0
              ) {
                Swal.fire("Workflow finished");
              }
            }
          }
          let totalTime = this.millisToMinutesAndSeconds(
            Date.now() - startTime
          );
          console.log(totalTime);
          this.$store.commit("addWorkingDir", "/input");
          this.$store.commit("resetRunInfo");
        }
      });
    },
    async runWorkFlow() {
      Swal.fire({
        title: `Run workflow?`,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Continue",
      }).then(async (result) => {
        if (result.isConfirmed) {
          this.$store.commit("addWorkingDir", "/input");
          let startTime = Date.now();
          for (let index of this.selectedSteps.entries()) {
            console.log(`Startin step: ${index[0] + 1} ${index[1].stepName}`);
            let Hostname = index[1].stepName.replace(/[ |]/g, "_");
            console.log(Hostname);
            this.$store.commit("addRunInfo", [
              true,
              "workflow",
              index[0],
              this.selectedSteps.length,
              Hostname,
            ]);
            let serviceIndex = this.findSelectedService(index[0]);
            let scriptName =
              this.selectedSteps[index[0]].services[serviceIndex].scriptName;
            let imageName =
              this.selectedSteps[index[0]].services[serviceIndex].imageName;
            let Input = this.$store.state.inputDir;
            let WorkingDir = this.$store.state.workingDir;
            let envVariables;
            envVariables = this.createVariableObj(index[0], serviceIndex);
            let Binds = this.createBinds(serviceIndex, index[0], Input);
            console.log(Binds);
            let gotImg = await imageExists(dockerode, imageName);
            if (gotImg === false) {
              console.log(`Pulling image ${imageName}`);
              this.$store.commit("activatePullLoader");
              let output = await pullImageAsync(dockerode, imageName);
              console.log(output);
              console.log(`Pull complete`);
              this.$store.commit("deactivatePullLoader");
            }
            console.log(
              `SCRIPT: ${scriptName}`,
              "\n",
              `IMAGE: ${imageName}`,
              "\n",
              `INPUT: ${Input}`,
              "\n",
              `WORKDIR: ${WorkingDir}`
            );
            console.log(envVariables);
            let result = await dockerode
              .run(
                imageName,
                ["sh", "-c", `/scripts/${scriptName}`],
                [stdout, stderr],
                {
                  Tty: false,
                  WorkingDir: WorkingDir,
                  Volumes: {},
                  name: Hostname,
                  HostConfig: {
                    Binds: Binds,
                  },
                  Env: envVariables,
                }
              )
              .then(async ([res, container]) => {
                console.log(stdout.toString());
                let resObj = { statusCode: res.StatusCode };
                container.remove();
                if (res.StatusCode === 0) {
                  resObj.log = stdout.toString();
                  return resObj;
                } else {
                  resObj.log = stderr.toString();
                  return resObj;
                }
              })
              .catch((err) => {
                this.$store.commit("resetRunInfo");
                let resObj = {};
                resObj.statusCode = err.statusCode;
                resObj.log = err.json.message;
                return resObj;
              });
            console.log(result);
            if (result.statusCode == 0) {
              let newWorkingDir = this.getVariableFromLog(
                result.log,
                "workingDir"
              );
              let newDataInfo = {
                dataFormat: this.getVariableFromLog(result.log, "dataFormat"),
                fileFormat: this.getVariableFromLog(result.log, "fileFormat"),
                readType: this.getVariableFromLog(result.log, "readType"),
              };
              this.$store.commit("addInputInfo", newDataInfo);
              this.$store.commit("addWorkingDir", newWorkingDir);
            } else {
              if (result.statusCode == 137 && result.log == "") {
                Swal.fire("Workflow stopped");
              } else {
                Swal.fire(result.log);
              }
              this.$store.commit("resetRunInfo");
              stdout = new streams.WritableStream();
              stderr = new streams.WritableStream();
              break;
            }
            stdout = new streams.WritableStream();
            stderr = new streams.WritableStream();
            console.log(`Finished step ${index[0] + 1}: ${index[1].stepName}`);
            this.$store.commit("resetRunInfo");
            if (
              this.selectedSteps.length == index[0] + 1 &&
              result.statusCode == 0
            ) {
              Swal.fire("Workflow finished");
            }
          }
          let totalTime = this.millisToMinutesAndSeconds(
            Date.now() - startTime
          );
          console.log(totalTime);
          this.$store.commit("addWorkingDir", "/input");
          this.$store.commit("resetRunInfo");
        }
      });
    },
    getVariableFromLog(log, varName) {
      var re = new RegExp(`(${varName}=.*)`, "g");
      let value = log.match(re)[0].replace('"', "").split("=")[1];
      return value;
    },
    createVariableObj(stepIndex, serviceIndex) {
      let envVariables = [];
      this.selectedSteps[stepIndex].services[serviceIndex].Inputs.forEach(
        (input) => {
          let varObj = {};
          varObj[input.name] = input.value;
          envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
        }
      );
      this.selectedSteps[stepIndex].services[serviceIndex].extraInputs.forEach(
        (input) => {
          let varObj = {};
          varObj[input.name] = input.value;
          envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
        }
      );
      let dataInfo = {
        workingDir: this.$store.state.workingDir,
        fileFormat: this.$store.state.data.fileFormat,
        dataFormat: this.$store.state.data.dataFormat,
        readType: this.$store.state.data.readType,
      };
      Object.entries(dataInfo).forEach(([key, value]) => {
        let varObj = {};
        varObj[key] = value;
        envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
      });
      return envVariables;
    },
    createCustomVariableObj(name, index) {
      let envVariables = [];
      this.$store.state[name][index].Inputs.forEach((input) => {
        let varObj = {};
        varObj[input.name] = input.value;
        envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
      });
      this.$store.state[name][index].extraInputs.forEach((input) => {
        let varObj = {};
        varObj[input.name] = input.value;
        envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
      });
      let dataInfo = {
        workingDir: this.$store.state.workingDir,
        fileFormat: this.$store.state.data.fileFormat,
        dataFormat: this.$store.state.data.dataFormat,
        readType: this.$store.state.data.readType,
      };
      Object.entries(dataInfo).forEach(([key, value]) => {
        let varObj = {};
        varObj[key] = value;
        envVariables.push(stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""));
      });
      return envVariables;
    },
    createCustomBinds(name, index, Input) {
      let Binds = [
        `${process.cwd()}/src/pipecraft-core/service_scripts:/scripts`, // dev path
        // `${process.cwd()}/resources/src/pipecraft-core/service_scripts:/scripts`, // build path
        `${Input}:/input`,
      ];
      this.$store.state[name][index].Inputs.forEach((input) => {
        if (input.type == "file" || input.type == "boolFile") {
          let correctedPath = path.dirname(slash(input.value));
          // let fileName = path.parse(correctedPath).base;
          let bind = `${correctedPath}:/extraFiles`;
          Binds.push(bind);
        }
      });
      this.$store.state[name][index].extraInputs.forEach((input) => {
        if (input.type == "file" || input.type == "boolfile") {
          let correctedPath = path.dirname(slash(input.value));
          // let fileName = path.parse(correctedPath).base;
          let bind = `${correctedPath}:/extraFiles`;
          Binds.push(bind);
        }
      });
      return Binds;
    },
    createBinds(serviceIndex, stepIndex, Input) {
      let scriptsPath =
        isDevelopment == true
          ? "/src/pipecraft-core/service_scripts"
          : "/resources/src/pipecraft-core/service_scripts";
      let Binds = [
        `${process.cwd()}${scriptsPath}:/scripts`,
        `${Input}:/input`,
      ];
      this.selectedSteps[stepIndex].services[serviceIndex].Inputs.forEach(
        (input) => {
          if (input.type == "file" || input.type == "boolfile") {
            let correctedPath = path.dirname(slash(input.value));
            // let fileName = path.parse(correctedPath).base;
            let bind = `${correctedPath}:/extraFiles`;
            Binds.push(bind);
          }
        }
      );
      // this.selectedSteps[stepIndex].services[serviceIndex].extraInputs.forEach((input) => {
      //   if (input.type == "file" || input.type == "boolfile") {
      //     let correctedPath = path.dirname(slash(input.value));
      //     // let fileName = path.parse(correctedPath).base;
      //     let bind = `${correctedPath}:/extraFiles`;
      //     Binds.push(bind);
      //   }
      // });
      return Binds;
    },

    findSelectedService(i) {
      let result;
      this.selectedSteps[i].services.forEach((input, index) => {
        if (input.selected === true || input.selected == "always") {
          result = index;
        }
      });
      return result;
    },
    async runStep(envVariables, scriptName, imageName) {
      var result = await ipcRenderer.sendSync(
        "runStep",
        imageName,
        scriptName,
        envVariables,
        this.$store.state.workingDir
      );
      return result;
    },
    millisToMinutesAndSeconds(millis) {
      var minutes = Math.floor(millis / 60000);
      var seconds = ((millis % 60000) / 1000).toFixed(0);
      return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
    },
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
.swal-wide {
  width: 850px !important;
}
.swal2-popup {
  width: auto;
}
</style>
