<template>
  <v-list dense>
    <v-list-item>
      <v-list-item-content @click="checkStat">
        <v-icon color="lime">
          mdi-docker
        </v-icon>
      </v-list-item-content>
    </v-list-item>

    <v-divider class="mt-2 mb-2"></v-divider>

    <v-list-item ripple link v-for="item in this.items" :key="item.title">
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-content>
        </template>
        <span>{{ item.tooltip }}</span>
      </v-tooltip>
    </v-list-item>
  </v-list>
</template>

<script>
// https://stackoverflow.com/questions/57041538/how-to-check-if-docker-is-running-or-not-after-reboot-on-windows-10
var Docker = require("dockerode");
var docker = new Docker({ socketPath: "//./pipe/docker_engine" });
import { ipcRenderer } from "electron";
export default {
  name: "rightNav",
  data() {
    return {
      items: [
        { title: "Home", icon: "mdi-content-save", tooltip: "save workflow" },
        { title: "About", icon: "mdi-folder-open", tooltip: "load workflow" },
      ],
    };
  },
  computed: {
    dockerStatus: async () => {
      let result = await ipcRenderer
        .sendSync("checkDockerStatus")
        .catch((err) => {
          console.log(err);
          let errorObj = { statusCode: err.code, log: err };
          return errorObj;
        });
      console.log(result.log);
      return result;
    },
  },
  methods: {
    async checkStat() {
      let result = await docker.version().catch((err) => {
        console.log(err);
        let errorObj = { statusCode: err.code, log: err };
        return errorObj;
      });
      console.log(result.log);
      return result;
    },
  },
};
</script>
