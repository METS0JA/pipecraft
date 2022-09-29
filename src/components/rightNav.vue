<template>
  <v-list dense>
    <v-list-item>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on">
            <v-icon large :color="dockerActive"> mdi-docker </v-icon>
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
            <v-icon
              :style="
                `/${item.title}` == $route.path
                  ? { color: '#1DE9B6' }
                  : { color: 'white' }
              "
              >{{ item.icon }}</v-icon
            >
          </v-list-item-content>
        </template>
        <span>{{ item.tooltip }}</span>
      </v-tooltip>
    </v-list-item>
    <v-tooltip left nudge-left="10">
      <template v-slot:activator="{ on }">
        <v-list-item v-on="on" class="mt-5" ripple link>
          <v-menu dark left nudge-left="15" offset-x>
            <template v-slot:activator="{ on, attrs }">
              <v-list-item-content v-on="on" v-bind="attrs">
                <v-icon
                  :style="
                    $route.path.includes('premade')
                      ? { color: '#1DE9B6' }
                      : { color: 'white' }
                  "
                  >mdi-more</v-icon
                >
              </v-list-item-content>
            </template>
            <v-list>
              <v-subheader>CUSTOM WORKFLOWS</v-subheader>
              <v-divider></v-divider>
              <v-list-item
                ripple
                link
                v-for="(item, index) in $store.state.customWorkflowInfo"
                :key="index"
                @click="push2premade(index)"
              >
                <v-list-item-title>{{
                  index.replace("_", " ")
                }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </v-list-item>
      </template>
      <span>custom workflows</span>
    </v-tooltip>
    <!--     <v-list-item style="padding: 0" class="mt-5" ripple link>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on" @click="push2premade('ASVs_workflow')">
            <div>
              <v-icon
                style="margin-right: -11px; margin-left: 11px"
                :style="
                  `/premade/ASVs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-a-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/ASVs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-s-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/ASVs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-v-box</v-icon
              >
            </div>
          </v-list-item-content>
        </template>
        <span>DADA2 workflow</span>
      </v-tooltip>
    </v-list-item> -->
    <!--     <v-list-item style="padding: 0" class="mt-5" ripple link>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content
            v-on="on"
            @click="push2premade('Metaworks_workflow')"
          >
            <div>
              <v-icon
                style="margin-right: -10px; margin-left: 5px"
                :style="
                  `/premade/Metaworks_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-m-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/Metaworks_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-e-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/Metaworks_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-t-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/Metaworks_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-a-box</v-icon
              >
            </div>
          </v-list-item-content>
        </template>
        <span>DADA2 workflow</span>
      </v-tooltip>
    </v-list-item> -->
    <!--     <v-list-item style="padding: 0" class="mt-5" ripple link>
      <v-tooltip left nudge-left="10">
        <template v-slot:activator="{ on }">
          <v-list-item-content v-on="on" @click="push2premade('OTUs_workflow')">
            <div>
              <v-icon
                style="margin-right: -11px; margin-left: 11px"
                :style="
                  `/premade/OTUs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-o-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/OTUs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-t-box</v-icon
              >
              <v-icon
                style="margin-right: -11px"
                :style="
                  `/premade/OTUs_workflow` == $route.path
                    ? { color: '#1DE9B6' }
                    : { color: 'white' }
                "
                >mdi-alpha-u-box</v-icon
              >
            </div>
          </v-list-item-content>
        </template>
        <span>OTU workflow</span>
      </v-tooltip>
    </v-list-item> -->
  </v-list>
</template>

<script>
import os from "os";
const { dialog } = require("@electron/remote");
const slash = require("slash");
const fs = require("fs");
var Docker = require("dockerode");
var socketPath =
  os.platform() === "win32" ? "//./pipe/docker_engine" : "/var/run/docker.sock";
var docker = new Docker({ socketPath: socketPath });
var JSONfn = require("json-fn");

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
          title: "fastqcANDmultiqc",
          icon: "mdi-beaker-check",
          tooltip: "QualityCheck (FastQC and MultiQC)",
          action: this.push2qc,
        },
        {
          title: "ExpertMode",
          icon: "mdi-puzzle-edit",
          tooltip: "Expert mode",
          action: this.push2expert,
        },
      ],
    };
  },
  created() {
    var self = this;
    setInterval(async function () {
      self.dockerActive = await docker
        .version()
        .then(() => {
          if (self.dockerActive != "#1DE9B6") {
            self.$store.commit("updateDockerStatus", "running");
          }
          return "#1DE9B6";
        })
        .catch(() => {
          self.$store.commit("updateDockerStatus", "stopped");
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
            var conf = [];
            let confJson;
            let configSavePath = slash(result.filePath);
            if (this.$route.params.workflowName) {
              conf.push(this.$store.state[this.$route.params.workflowName]);
              conf.push(this.$route.params.workflowName);
              confJson = JSONfn.stringify(conf);
            } else {
              confJson = JSONfn.stringify(this.$store.state.selectedSteps);
            }
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
            let configObj = JSONfn.parse(configJSON);
            if (Object.keys(this.$store.state).includes(configObj[1])) {
              this.$store.commit("loadCustomWorkflow", configObj);
              this.$router.push(`/premade/${configObj[1]}`);
            } else {
              this.$store.commit("loadWorkflow", configObj);
            }
          }
        });
    },
    push2premade(name) {
      if (this.$route.path != `/premade/${name}`) {
        this.$router.push(`/premade/${name}`);
      }
    },
    push2qc() {
      if (this.$route.path != "/fastqcANDmultiqc") {
        this.$router.push("/fastqcANDmultiqc");
      }
    },
    push2expert() {
      if (this.$route.path != "/ExpertMode") {
        this.$router.push("/ExpertMode");
      }
    },
  },
};
</script>

<style scoped>
.column {
  float: left;
  width: 33.33%;
  padding: 5px;
}

/* Clear floats after image containers */
.row::after {
  content: "";
  clear: both;
  display: table;
}
.v-icon.v-icon::after {
  transform: scale(1);
}
.material icons.primary header material icon first menu {
  margin-left: -2 px;
}
</style>
