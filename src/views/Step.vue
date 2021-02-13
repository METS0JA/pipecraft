<template>
  <v-row justify="center" style="padding-top:20px">
    <v-expansion-panels dark multiple popout>
      <v-expansion-panel
        v-for="(service, index) in stepData.services"
        :key="index"
      >
        <v-expansion-panel-header>{{
          service.serviceName
        }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <HelloWorldVue :index="index" />
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
import HelloWorldVue from "../components/HelloWorld.vue";
export default {
  name: "Home",
  data: () => ({
    numberRules: [(v) => isNaN(v) != true],
  }),
  components: {
    HelloWorldVue,
  },
  computed: {
    stepData() {
      return this.$store.state.selectedSteps[this.$route.params.order];
    },
  },
};
</script>
