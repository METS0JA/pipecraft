<template>
  <v-row justify="center">
    <v-expansion-panels popout>
      <v-expansion-panel v-for="(item, i) in 5" :key="i">
        <v-expansion-panel-header>Item</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="about">
            <span @click="testAttrs()">{{ stepData.stepName }}</span>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
// import SelectedRoutes from "../components/SelectedRoutes";
export default {
  name: "AddMenu",
  components: {
    // SelectedRoutes,
  },
  data: () => ({}),
  computed: {
    selectedSteps() {
      return this.$store.state.selectedSteps;
    },
    stepData() {
      return this.$store.state.selectedSteps.find(
        (selectedStep) => selectedStep.route === this.$attrs.route,
      );
    },
  },
  methods: {
    selectService() {
      this.$store.commit("selectService");
    },
    testAttrs() {
      console.log(this.stepData);
    },
  },
};
</script>

<style scoped></style>
