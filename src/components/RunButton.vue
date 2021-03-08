<template>
  <v-btn block color="grey" @click="runStep">
    Run workflow
  </v-btn>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapState } from "vuex";
import { stringify } from "envfile";

ipcRenderer.on("log", (event, log) => {
  console.log(log);
});

export default {
  name: "Run",
  computed: mapState({
    // arrow functions can make the code very succinct!
    env_variables: (state) => state.env_variables,
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
        console.log(envVariables);
        // let stepResult = await this.runStep(envVariables)
      });
    },
    runStep() {
      var scriptName = `reorient_paired_end_reads.sh`;
      var imageName = "pipecraft/mothur:1.43";
      var envVariables = ["a=1", "b=2", "c=3"];
      console.log(
        ipcRenderer.sendSync(
          "runStep",
          imageName,
          scriptName,
          envVariables,
          this.$store.state.workingDir,
        ),
      );
      //     "runStep",
      //     serviceName,
      //     envVariables,
      //   );

      // (async (envVariables, serviceName) => {
      //   const result = await ipcRenderer.invoke(
      //     "runStep",
      //     serviceName,
      //     envVariables,
      //   );
      //   console.log(result);
      // })();
    },
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
</style>
