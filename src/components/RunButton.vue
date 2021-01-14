<template>
  <v-btn block color="grey" @click="runStep">
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

<style></style>
