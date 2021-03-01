<template>
  <v-list dense rounded>
    <v-list-item>
      <v-list-item-content>
        <RunButton />
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <v-btn block color="grey" @click="fileSelect">
          Select workDir
        </v-btn>
      </v-list-item-content>
    </v-list-item>
    <v-list-item>
      <v-list-item-content>
        <AddMenu />
      </v-list-item-content>
    </v-list-item>
    <RouteButtons />
    <v-divider></v-divider>
    <SelectedRoutes />
  </v-list>
</template>

<script>
const { dialog } = require("electron").remote;
import AddMenu from "./AddMenu.vue";
import RouteButtons from "./RouteButtons";
import RunButton from "./RunButton";
import SelectedRoutes from "./SelectedRoutes";

export default {
  name: "leftNav",
  components: { AddMenu, RouteButtons, RunButton, SelectedRoutes },
  data() {
    return {
      items: [
        { title: "Home", icon: "mdi-view-dashboard" },
        { title: "About", icon: "mdi-forum" },
      ],
    };
  },
  methods: {
    fileSelect() {
      dialog
        .showOpenDialog({
          title: "Select working directory",
          properties: ["showHiddenFiles", "openDirectory"],
        })
        .then((result) => {
          console.log(result.filePaths[0]);
          this.$store.commit("addWorkingDir", result.filePaths[0]);
        })
        .catch((err) => {
          console.log(err);
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
