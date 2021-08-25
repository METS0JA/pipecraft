<template>
  <v-list dense>
    <v-list-item>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on">
            <v-icon large :color="dockerActive">
              mdi-docker
            </v-icon>
          </v-list-item-content>
        </template>
        <span v-if="dockerActive === '#1DE9B6'">docker desktop is running</span>
        <span v-else-if="dockerActive === '#FF7043'"
          >docker desktop stopped</span
        >
      </v-tooltip>
    </v-list-item>

    <v-divider class="mt-2 mb-2"></v-divider>

    <v-list-item
      class="mt-5"
      ripple
      link
      v-for="item in this.items"
      :key="item.title"
    >
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on" @click="item.action">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-content>
        </template>
        <span>{{ item.tooltip }}</span>
      </v-tooltip>
    </v-list-item>
    <v-list-item class="mt-5" ripple link>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on" @click="push2premade('DADA2_Miseq')">
            <v-icon
              :style="
                `/premade/dada2Miseq` == $route.path
                  ? { color: '#1DE9B6' }
                  : { color: 'white' }
              "
              >mdi-alpha-d-box</v-icon
            >
          </v-list-item-content>
        </template>
        <span>DADA2 MiSeq workflow</span>
      </v-tooltip>
    </v-list-item>
    <v-list-item class="mt-5" ripple link>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on" @click="push2premade('OTU_Miseq')">
            <v-icon
              :style="
                `/premade/OTU_Miseq` == $route.path
                  ? { color: '#1DE9B6' }
                  : { color: 'white' }
              "
              >mdi-alpha-d-box</v-icon
            >
          </v-list-item-content>
        </template>
        <span>OTU MiSeq workflow</span>
      </v-tooltip>
    </v-list-item>
  </v-list>
</template>

<script>
const { dialog } = require("electron").remote;
const slash = require("slash");
const fs = require("fs");
var Docker = require("dockerode");
var docker = new Docker({ socketPath: "//./pipe/docker_engine" });
export default {
  name: "rightNav",
  data() {
    return {
      dockerActive: "pending",
      items: [
        {
          title: "Save",
          icon: "mdi-content-save",
          tooltip: "save workflow",
          action: this.saveWorkFlow,
        },
        {
          title: "Load",
          icon: "mdi-folder-open",
          tooltip: "load workflow",
          action: this.loadWorkFlow,
        },
        {
          title: "Exper",
          icon: "mdi-iframe",
          tooltip: "expert mode",
          action: "",
        },
        {
          title: "Step-by-step mode",
          icon: "mdi-format-list-bulleted",
          tooltip: "step-by-step mode",
          action: "",
        },
        {
          title: "Usearch",
          icon: "mdi-alpha-u-box",
          tooltip: "get usearch",
          action: "",
        },
      ],
    };
  },
  created() {
    var self = this;
    setInterval(async function() {
      self.dockerActive = await docker
        .version()
        .then(() => {
          return "#1DE9B6";
        })
        .catch(() => {
          return "#FF7043";
        });
    }, 1000);
  },
  methods: {
    saveWorkFlow() {
      dialog
        .showSaveDialog({
          title: "Save current configuration",
          filters: [{ name: "JSON", extensions: ["JSON"] }],
        })
        .then((result) => {
          if (result.canceled !== true) {
            let configSavePath = slash(result.filePath);
            let confJson = JSON.stringify(this.$store.state.selectedSteps);
            fs.writeFileSync(configSavePath, confJson);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    loadWorkFlow() {
      dialog
        .showOpenDialog({
          title: "Select a previous configuration",
          filters: [{ name: "JSON", extensions: ["JSON"] }],
        })
        .then((result) => {
          if (result.canceled !== true) {
            let configLoadPath = slash(result.filePaths[0]);
            let configJSON = fs.readFileSync(configLoadPath);
            let configObj = JSON.parse(configJSON);
            this.$store.commit("loadWorkflow", configObj);
          }
        });
    },
    push2premade(name) {
      if (this.$route.path != `/premade/${name}`) {
        this.$router.push(`/premade/${name}`);
      }
    },
  },
};
</script>
