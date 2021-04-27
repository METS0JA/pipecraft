<template>
  <v-btn
    block
    color="grey"
    @click="
      $route.params.workflowName
        ? runCustomWorkFlow($route.params.workflowName)
        : runWorkFlow()
    "
  >
    Run workflow
  </v-btn>
</template>

<script>
const Swal = require("sweetalert2");
var Docker = require("dockerode");
var docker = new Docker({ socketPath: "//./pipe/docker_engine" });
const streams = require("memory-streams");
var stdout = new streams.WritableStream();
var stderr = new streams.WritableStream();
import { ipcRenderer } from "electron";
import { mapState } from "vuex";
import { stringify } from "envfile";

export default {
  name: "Run",
  computed: mapState({
    selectedSteps: (state) => state.selectedSteps,
  }),
  data: () => ({
    items: [],
  }),
  methods: {
    async checkImage(imageName) {
      console.log(imageName);
      let repoList = [];
      let imageList = await docker.listImages();
      imageList.forEach((image) => {
        repoList.push(image.RepoTags[0]);
      });
      console.log(repoList);
      if (repoList.includes(imageName) === false) {
        console.log(`pulling image ${imageName}`);
        await docker.pull(imageName, (err, stream) => {
          console.log(err);
          docker.modem.followProgress(stream, onFinished, onProgress);
          function onFinished(err, output) {
            if (!err) {
              console.log(output);
              console.log("\nDone pulling.");
            } else {
              console.log(err);
              process.exit(1);
            }
          }
          function onProgress(event) {
            console.log(event);
          }
        });
      }
    },
    async runCustomWorkFlow(name) {
      console.log(name);
      this.$store.commit("addWorkingDir", "/input");
      for (let index of this.$store.state[name].entries()) {
        console.log(`Startin step ${index[0] + 1}: ${index[1].serviceName}`);
        let scriptName = this.$store.state[name][index[0]].scriptName;
        let imageName = this.$store.state[name][index[0]].imageName;
        let Input = this.$store.state.inputDir;
        let WorkingDir = this.$store.state.workingDir;
        console.log(scriptName, imageName, Input, WorkingDir);
        let envVariables;
        envVariables = this.createCustomVariableObj(name, index[0]);
        console.log(envVariables);
        await this.checkImage(imageName);
        let result = await docker
          .run(
            imageName,
            ["sh", "-c", `/scripts/${scriptName}`],
            [stdout, stderr],
            {
              Tty: false,
              WorkingDir: WorkingDir,
              Volumes: {},
              HostConfig: {
                Binds: [
                  `${process.cwd()}/src/pipecraft-core/service_scripts:/scripts`, // Edit path for build
                  `${Input}:/input`,
                ],
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
            let resObj = {};
            resObj.statusCode = err.statusCode;
            resObj.log = err.json.message;
            return resObj;
          });
        console.log(result);
        if (result.statusCode == 0) {
          let newWorkingDir = this.getVariableFromLog(result.log, "workingDir");
          let newDataInfo = {
            dataFormat: this.getVariableFromLog(result.log, "dataFormat"),
            fileFormat: this.getVariableFromLog(result.log, "fileFormat"),
            readType: this.getVariableFromLog(result.log, "readType"),
          };
          this.$store.commit("addInputInfo", newDataInfo);
          this.$store.commit("addWorkingDir", newWorkingDir);
        } else {
          Swal.fire(result.log);
          stdout = new streams.WritableStream();
          stderr = new streams.WritableStream();
          break;
        }
        stdout = new streams.WritableStream();
        stderr = new streams.WritableStream();
        console.log(`Finished step ${index[0] + 1}: ${index[1].serviceName}`);
      }
    },
    async runWorkFlow() {
      this.$store.commit("addWorkingDir", "/input");
      for (let index of this.selectedSteps.entries()) {
        let envVariables;
        console.log(`Startin step ${index[0] + 1} ${index[1].stepName}`);
        let serviceIndex = this.findSelectedService(index[0]);
        envVariables = this.createVariableObj(index[0], serviceIndex);
        console.log(envVariables);
        let scriptName = this.selectedSteps[index[0]].services[serviceIndex]
          .scriptName;
        let imageName = this.selectedSteps[index[0]].services[serviceIndex]
          .imageName;
        let Input = this.$store.state.inputDir;
        let WorkingDir = this.$store.state.workingDir;
        var result = await docker
          .run(
            imageName,
            ["sh", "-c", `/scripts/${scriptName}`],
            [stdout, stderr],
            {
              Tty: false,
              WorkingDir: WorkingDir,
              Volumes: {},
              HostConfig: {
                Binds: [
                  `${process.cwd()}/src/pipecraft-core/service_scripts:/scripts`, // Edit path for build
                  `${Input}:/input`,
                ],
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
            console.log(err);
            let resObj = { statusCode: err.code, log: err };
            return resObj;
          });
        console.log(result.log);
        let newWorkingDir = this.getVariableFromLog(result.log, "workingDir");
        console.log(newWorkingDir);
        let newDataInfo = {
          dataFormat: this.getVariableFromLog(result.log, "dataFormat"),
          fileFormat: this.getVariableFromLog(result.log, "fileFormat"),
          readType: this.getVariableFromLog(result.log, "readType"),
        };
        this.$store.commit("addInputInfo", newDataInfo);
        this.$store.commit("addWorkingDir", newWorkingDir);
        stdout = new streams.WritableStream();
        stderr = new streams.WritableStream();
      }
    },
    getVariableFromLog(log, varName) {
      var re = new RegExp(`(${varName}=.*)`, "g");
      let value = log
        .match(re)[0]
        .replace('"', "")
        .split("=")[1];
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

    findSelectedService(i) {
      let result;
      this.selectedSteps[i].services.forEach((input, index) => {
        if (input.selected === true) {
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
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
</style>
