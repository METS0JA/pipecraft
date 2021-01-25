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
          @click="addRoute(item, nrOfSelectedSteps)"
        >
          <v-list-item-title>{{ item.stepName }}</v-list-item-title>
          <v-icon 
            >mdi-plus-box</v-icon
          >
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
      this.$router.addRoutes([
        {
          path: `/${item.stepName}/${nrOfSelectedSteps}`,
          component: About,
          props: { stepName: item.stepName, stepOrder: nrOfSelectedSteps },
        },
      ]);
      this.$router.push(`/${item.stepName}/${nrOfSelectedSteps}`);
      console.log(item.stepName, nrOfSelectedSteps);
        this.addStep(item)
    },
    addStep(item) {
      this.$store.commit("addStep", {
        step: item,
        order: this.nrOfSelectedSteps,
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
