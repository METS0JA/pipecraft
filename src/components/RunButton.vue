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
    async confirmRun(name) {
      let result = await Swal.fire({
        title: `Run ${name.replace(/_/g, " ")}?`,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Continue",
      });
      return result;
    },
    async runCustomWorkFlow(name) {
      this.confirmRun(name).then(async (result) => {
        if (result.isConfirmed) {
          this.$store.commit("addWorkingDir", "/input");
          let startTime = Date.now();
          let steps2Run = this.$store.getters.steps2Run(name);
          console.log(steps2Run);
          console.log(startTime);
          for (let [index, element] of this.$store.state[name].entries()) {
            if (element.selected == true || element.selected == "always") {
              let Hostname = element.serviceName.replace(" ", "_");
              let container = await dockerode.getContainer(Hostname);
              let nameConflicts = await container
                .remove({ force: true })
                .then(async () => {
                  return "Removed conflicting duplicate container";
                })
                .catch(() => {
                  return "No conflicting container names";
                });
              console.log(nameConflicts);
              this.$store.commit("addRunInfo", [
                true,
                "customWorkflow",
                index,
                element.length,
                Hostname,
              ]);
              let scriptName = element.scriptName;
              let imageName = element.imageName;
              let Input = this.$store.state.inputDir;
              let WorkingDir = this.$store.state.workingDir;
              let envVariables;
              envVariables = this.createCustomVariableObj(element);
              let Binds = this.createCustomBinds(element, Input);
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
              console.log(envVariables);
              let userInfo = os.userInfo();
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
                      CpuCount: 6,
                    },
                    Env: envVariables,
                    User: `${Math.abs(userInfo.uid)}`,
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
                if (result.statusCode == 137) {
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
              console.log(`Finished step ${index + 1}: ${element.serviceName}`);
              this.$store.commit("resetRunInfo");
              if (result.statusCode == 0) {
                steps2Run -= 1;
                if (steps2Run == 0) {
                  Swal.fire("Workflow finished");
                }
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
            let container = await dockerode.getContainer(Hostname);
            let nameConflicts = await container
              .remove({ force: true })
              .then(async () => {
                return "Removed conflicting duplicate container";
              })
              .catch(() => {
                return "No conflicting container names";
              });
            console.log(nameConflicts);
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
            let userInfo = os.userInfo();
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
                    CpuCount: 6,
                  },
                  Env: envVariables,
                  User: `${Math.abs(userInfo.uid)}`,
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
              this.$store.commit("toggle_PE_SE_scripts", newDataInfo.readType);
              this.$store.commit("addInputInfo", newDataInfo);
              this.$store.commit("addWorkingDir", newWorkingDir);
            } else {
              if (result.statusCode == 137) {
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
    createCustomVariableObj(element) {
      let envVariables = [];
      let inputs = element.Inputs.concat(element.extraInputs);
      inputs.forEach((input) => {
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
    createCustomBinds(element, Input) {
      let scriptsPath =
        isDevelopment == true
          ? `${slash(process.cwd())}/src/pipecraft-core/service_scripts`
          : `${process.resourcesPath}/src/pipecraft-core/service_scripts`;
      let Binds = [`${scriptsPath}:/scripts`, `${Input}:/input`];
      let serviceInputs = element.Inputs.concat(element.extraInputs);
      serviceInputs.forEach((input, index) => {
        if (
          input.type == "file" ||
          (input.type == "boolfile" && input.active == true)
        ) {
          let correctedPath = path.dirname(slash(input.value));
          if (index == 0) {
            let bind = `${correctedPath}:/extraFiles`;
            Binds.push(bind);
          } else {
            let bind = `${correctedPath}:/extraFiles${index + 1}`;
            Binds.push(bind);
          }
        }
      });
      return Binds;
    },
    createBinds(serviceIndex, stepIndex, Input) {
      let scriptsPath =
        isDevelopment == true
          ? `${slash(process.cwd())}/src/pipecraft-core/service_scripts`
          : `${process.resourcesPath}/src/pipecraft-core/service_scripts`;
      let Binds = [`${scriptsPath}:/scripts`, `${Input}:/input`];
      let serviceInputs = this.selectedSteps[stepIndex].services[
        serviceIndex
      ].Inputs.concat(
        this.selectedSteps[stepIndex].services[serviceIndex].extraInputs
      );
      serviceInputs.forEach((input, index) => {
        if (
          input.type == "file" ||
          (input.type == "boolfile" && input.active == true)
        ) {
          let correctedPath = path.dirname(slash(input.value));
          // let fileName = path.parse(correctedPath).base;
          if (index == 0) {
            let bind = `${correctedPath}:/extraFiles`;
            Binds.push(bind);
          } else {
            let bind = `${correctedPath}:/extraFiles${index + 1}`;
            Binds.push(bind);
          }
        }
      });
      return Binds;
    },
    findAndRemoveContainer() {},
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
