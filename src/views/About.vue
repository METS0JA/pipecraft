<template>
  <v-row justify="center">
    <v-expansion-panels popout>
      <v-expansion-panel v-for="(item, i) in 5" :key="i">
        <v-expansion-panel-header>Item</v-expansion-panel-header>
        <v-expansion-panel-content>
          <div class="about">
            <span @click="testAttrs($attrs.stepName)">{{
              $attrs.stepName
            }}</span>
            <span @click="testAttrs($attrs.stepOrder)">{{
              $attrs.stepOrder
            }}</span>
          </div>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
export default {
  name: "AddMenu",
  data: () => ({
    items2: [],
  }),
  computed: {
    selectedSteps() {
      return this.$store.state.selectedSteps;
    },
  },
  methods: {
    addStep(item) {
      this.$store.commit("addStep", {
        step: item,
        order: this.nrOfSelectedSteps,
      });
    },
    testAttrs(attr) {
      console.log(attr);
    },
  },
};
</script>

<style scoped>
</style>