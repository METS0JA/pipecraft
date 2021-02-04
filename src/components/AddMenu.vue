<template>
  <div class="text-center">
    <v-menu offset-x>
      <template v-slot:activator="{ on, attrs }">
        <v-btn block color="grey" dark v-bind="attrs" v-on="on">
          add step
        </v-btn>
      </template>
      <v-list dark>
        <v-list-item
          link
          v-for="item in items"
          v-bind:key="item.stepName"
          @click="addStep(item, nrOfSelectedSteps)"
        >
          <v-list-item-title>{{ item.stepName }}</v-list-item-title>
          <v-icon>mdi-plus-box</v-icon>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
// import { component } from "vue/types/umd";
import About from "../views/About";
import { mapState } from "vuex";

export default {
  name: "AddMenu",
  data: () => ({
    items2: [],
  }),
  computed: mapState({
    // arrow functions can make the code very succinct!
    items: (state) => state.steps,
    nrOfSelectedSteps: (state) => state.selectedSteps.length + 1,
  }),
  methods: {
    addRoute: function(item, nrOfSelectedSteps) {
      let route = `/${item.stepName}/${nrOfSelectedSteps}`.replace(/\s/g, "");
      this.$router.addRoutes([
        {
          path: route,
          component: About,
          props: {
            route: route,
          },
        },
      ]);
      if (this.$route.path != route) {
        this.$router.push(route);
      }
      this.addStep(item, nrOfSelectedSteps);
    },
    addStep(item, nrOfSelectedSteps) {
      let route = `/step/${item.stepName}/${nrOfSelectedSteps}`.replace(
        /\s/g,
        "",
      );
      this.$store.commit("addStep", {
        step: item,
        route: route,
      });
    },
  },
};
</script>

<style scoped>
.v-btn {
  justify-content: center;
}
.v-list-item__title {
  padding-right: 15px;
  text-transform: uppercase;
}
</style>
