<template>
  <v-list dense rounded>
    <v-list-item>
      <v-list-item-content>
        <RunButton />
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
};
</script>
