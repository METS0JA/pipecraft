<template>
  <v-list dense rounded>
    <v-list-item>
      <v-list-item-content>
        <RunButton />
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn block color="grey" @click="folderSelect">
          Select workDir
        </v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <AddMenu />
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
            title: "Sequencing read types",
            inputOptions: {
              singleend: "paired-end",
              pairedend: "single-end",
            },
          },
          {
            title: "Sequencing data format",
            inputOptions: {
              demulitplexed: "demulitplexed",
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
                fastqDOTgz: "*.fastq.gz",
                fastaDOTgz: "*.fasta.gz",
                fqDOTgz: "*.fq.gz",
                faDOTgz: "*.fa.gz",
                txtDOTgz: "*.txt.gz",
              },
            },
          },
        ])
        .then((result) => {
          if (result.value) {
            dialog
              .showOpenDialog({
                title: "Select the folder containing your sequnece files",
                properties: ["openDirectory", "showHiddenFiles"],
              })
              .then((result) => {
                if (typeof result.filePaths[0] !== "undefined") {
                  var correctedPath = slash(result.filePaths[0]);
                  this.$store.commit("addWorkingDir", correctedPath);
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
</style>
