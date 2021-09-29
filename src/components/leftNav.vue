<template>
  <v-list dense rounded>
    <v-list-item>
      <v-list-item-content>
        <v-btn block color="grey" @click="folderSelect">
          Select workDir
        </v-btn>
      </v-list-item-content>
    </v-list-item>
    <!-- <v-list-item>
      <v-list-item-content>
        <v-btn
          block
          :loading="loading"
          :disabled="loading"
          color="grey"
          @click="loader = 'loading'"
        >
          Run and load
          <template v-slot:loader>
            <span class="custom-loader">
              <v-icon light>mdi-cached</v-icon>
            </span>
          </template>
        </v-btn>
      </v-list-item-content>
    </v-list-item> -->
    <v-list-item>
      <v-list-item-content>
        <AddMenu />
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <RunButton />
      </v-list-item-content>
    </v-list-item>
    <v-divider></v-divider>
    <SelectedRoutes />
  </v-list>
</template>

<script>
// var path = require("path");
const Swal = require("sweetalert2");
const slash = require("slash");
const { dialog } = require("electron").remote;
import AddMenu from "./AddMenu.vue";
import RunButton from "./RunButton";
import SelectedRoutes from "./SelectedRoutes";

export default {
  name: "leftNav",
  components: { AddMenu, RunButton, SelectedRoutes },
  data() {
    return {
      loader: null,
      loading: false,
    };
  },
  watch: {
    loader() {
      const l = this.loader;
      this[l] = !this[l];

      setTimeout(() => (this[l] = false), 9000);

      this.loader = null;
    },
  },
  methods: {
    folderSelect() {
      Swal.mixin({
        input: "select",
        confirmButtonText: "Next &rarr;",
        showCancelButton: true,
        progressSteps: ["1", "2", "3"],
      })
        .queue([
          {
            title: "Sequencing data format",
            inputOptions: {
              demultiplexed: "demultiplexed",
              multiplexed: "multiplexed",
            },
          },
          {
            title: "Sequence files extension",
            inputOptions: {
              Uncompressed: {
                fastq: "*.fastq",
                fasta: "*.fasta",
                fq: "*.fq",
                fa: "*.fa",
                txt: "*.txt",
              },
              Compressed: {
                fastq_gz: "*.fastq.gz",
                fasta_gz: "*.fasta.gz",
                fq_gz: "*.fq.gz",
                fa_gz: "*.fa.gz",
                txt_gz: "*.txt.gz",
              },
            },
          },
          {
            title: "Sequencing read types",
            inputOptions: {
              paired_end: "paired-end",
              single_end: "single-end",
            },
          },
        ])
        .then(async (result) => {
          if (result.value) {
            this.$store.commit("addInputInfo", {
              readType: result.value[2],
              dataFormat: result.value[0],
              fileFormat: result.value[1].replace("_", "."),
            });
            this.$store.commit("toggle_PE_SE_scripts", result.value[2]);
            this.$store.commit("toggle_demux_mux", result.value[0]);
            dialog
              .showOpenDialog({
                title: "Select the folder containing your sequnece files",
                properties: ["openDirectory", "showHiddenFiles"],
              })
              .then((result) => {
                if (typeof result.filePaths[0] !== "undefined") {
                  var correctedPath = slash(result.filePaths[0]);
                  this.$store.commit("addInputDir", correctedPath);
                }
              })
              .catch((err) => {
                console.log(err);
              });
          }
        });
    },
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
.custom-loader {
  animation: loader 1s infinite;
  display: flex;
}
@-moz-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-webkit-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@-o-keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
@keyframes loader {
  from {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
