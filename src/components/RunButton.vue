<template>
  <v-btn block color="grey" @click="runWorkFlow">
    Run workflow
  </v-btn>
</template>

<script>
import { ipcRenderer } from "electron";
import { mapState } from "vuex";

ipcRenderer.on("log", (event, log) => {
  console.log(log);
});

export default {
  name: "Run",
  computed: mapState({
    // arrow functions can make the code very succinct!
    env_variables: (state) => state.env_variables,
    selectedSteps: (state) => state.steps,
  }),
  data: () => ({
    items: [
      { title: "Demultiplex" },
      { title: "Cut adapaters" },
      { title: "Quality filter" },
      { title: "Remove chimeras" },
      { title: "Assemble paired sequences" },
      { title: "Extract genes" },
      { title: "Cluster" },
      { title: "Assing taxonomy" },
    ],
  }),
  methods: {
    runWorkFlow() {
      this.selectedSteps.forEach((step) => {
        console.log(step.stepName);
        console.log(step.services[0]);
        let services = step.services[0];
        for (const [key, value] of Object.entries(services)) {
          console.log(key, value);
          console.log(value[0].selected);
        }
      });
    },
    runStep() {
      (async (env_variables) => {
        const result = await ipcRenderer.invoke(
          "runStep",
          "vsearch-quality",
          env_variables,
        );
        console.log(result);
      })();
    },
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
</style>
