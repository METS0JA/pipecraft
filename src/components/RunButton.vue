<template>
  <v-btn block color="grey" @click="runWorkFlow2">
    Run workflow
  </v-btn>
</template>

<script>
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
    createVariableObj(stepIndex, serviceIndex) {
      let envVariables = [];
      const listInputTypes = ["selectInputs", "booleanSelectInputs"];
      const inputTypes = [
        "chipInputs",
        "fileInputs",
        "numericInputs",
        "booleanInputs",
        "booleanFileInputs",
      ];
      for (let index = 0; index < inputTypes.length; index++) {
        const element = inputTypes[index];
        this.selectedSteps[stepIndex].services[serviceIndex][element].forEach(
          (input) => {
            if (input.active === false) {
              let varObj = {};
              varObj[input.name] = "inactive";
              envVariables.push(
                stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""),
              );
            } else {
              let varObj = {};
              varObj[input.name] = input.value;
              envVariables.push(
                stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""),
              );
            }
          },
        );
      }
      for (let index = 0; index < listInputTypes.length; index++) {
        const element = listInputTypes[index];
        this.selectedSteps[stepIndex].services[serviceIndex][element].forEach(
          (input) => {
            if (input.active === false) {
              let varObj = {};
              varObj[input.name] = "inactive";
              envVariables.push(
                stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""),
              );
            } else {
              let varObj = {};
              varObj[input.name] = input.value;
              envVariables.push(
                stringify(varObj).replace(/(\r\n|\n|\r)/gm, ""),
              );
            }
          },
        );
      }
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
    runWorkFlow() {
      this.selectedSteps.forEach(async (step, index) => {
        let serviceIndex = this.findSelectedService(index);
        let envVariables = this.createVariableObj(index, serviceIndex);
        let scriptName = this.selectedSteps[index].services[serviceIndex]
          .scriptName;
        let imageName = this.selectedSteps[index].services[serviceIndex]
          .imageName;
        console.log(imageName);
        console.log(scriptName);
        console.log(serviceIndex);
        console.log(envVariables);
        let stepResult = await this.runStep(
          envVariables,
          scriptName,
          imageName,
        );
        console.log(stepResult.log);
        console.log(stepResult.statusCode);
      });
    },
    async runWorkFlow2() {
      for (let index of this.selectedSteps.entries()) {
        console.log(`Startin step ${index[0] + 1} ${index[1].stepName}`);
        let serviceIndex = this.findSelectedService(index[0]);
        let envVariables = this.createVariableObj(index[0], serviceIndex);
        let scriptName = this.selectedSteps[index[0]].services[serviceIndex]
          .scriptName;
        let imageName = this.selectedSteps[index[0]].services[serviceIndex]
          .imageName;
        let stepResult = await this.runStep(
          envVariables,
          scriptName,
          imageName,
        );
        console.log(stepResult.log);
        console.log(stepResult.statusCode);
        console.log(
          `Finished step ${index[0] + 1} ${
            index[1].stepName
          } with statusCode: ${stepResult.statusCode}`,
        );
      }
    },
    async runStep(envVariables, scriptName, imageName) {
      var result = await ipcRenderer.sendSync(
        "runStep",
        imageName,
        scriptName,
        envVariables,
        this.$store.state.workingDir,
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
