<template>
  <div class="text-center">
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-btn block color="grey" dark v-bind="attrs" v-on="on">
          Dropdown
        </v-btn>
      </template>
      <v-list>
        <v-list-item v-for="(item, index) in items" :key="index">
          <v-list-item-title>{{ item.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import About from "../views/About";
export default {
  name: "AddMenu",
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
    addNewRoute() {
      this.$router.addRoute({
        path: "/about",
        name: "about",
        component: About,
      });
    },
  },
};
</script>
