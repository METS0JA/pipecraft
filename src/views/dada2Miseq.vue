<template>
  <!-- each sub component must recive -->
  <v-row justify="center" style="padding-top:20px">
    <v-card
      height="fit-content"
      width="100%"
      class=" mr-4 ml-4 mb-2"
      dark
      elevation="2"
    >
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-card-title
            v-on="on"
            style="justify-content:center; padding:10px 0px;"
            >DADA2 MiSeq workflow</v-card-title
          >
        </template>
        <span>tip me please</span>
      </v-tooltip>
      <v-card-text
        class="pr-15 pl-15 text-center"
        style="justify-content:center;"
        >This workflow is based on DADA2 Pipeline tutorial
        <a href="https://benjjneb.github.io/dada2/tutorial.html" target="_blank"
          >https://benjjneb.github.io/dada2/tutorial.html</a
        ></v-card-text
      >
    </v-card>
    <v-expansion-panels dark multiple popout>
      <v-expansion-panel v-for="(service, index) in services" :key="index">
        <v-expansion-panel-header style="justify-content:center">
          {{ service.serviceName }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col
              v-for="(input, i) in service.Inputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content; width:fit-content"
            >
              <v-container v-if="input.type === 'numeric'"
                ><InputNumeric
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'bool'"
                ><InputBool
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'select'"
                ><InputSelect
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'file'"
                ><InputFile
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'boolfile'"
                ><InputBoolFile
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'boolselect'"
                ><InputBoolSelect
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'chip'"
                ><InputChip
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
              <v-container v-if="input.type === 'slide'"
                ><InputSlide
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'Inputs'"
              /></v-container>
            </v-col>
          </v-row>
          <v-row
            v-if="service.extraInputs.length > 0 && service.showExtra == true"
          >
            <v-col
              v-for="(input, i) in service.extraInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content; width:fit-content"
            >
              <v-container v-if="input.type === 'numeric'"
                ><InputNumeric
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'bool'"
                ><InputBool
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'select'"
                ><InputSelect
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'file'"
                ><InputFile
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'boolfile'"
                ><InputBoolFile
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'boolselect'"
                ><InputBoolSelect
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'chip'"
                ><InputChip
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
              <v-container v-if="input.type === 'slide'"
                ><InputSlide
                  :serviceIndex="index"
                  :inputIndex="i"
                  :list="'extraInputs'"
              /></v-container>
            </v-col>
          </v-row>
          <v-row v-if="service.extraInputs.length > 0" justify="center">
            <v-btn
              light
              class="mt-5 mb-5"
              style="justify-content: center;"
              @click="toggleExtra(index)"
            >
              toggle advance options
            </v-btn></v-row
          >
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
import InputNumeric from "../components/InputNumeric.vue";
import InputBool from "../components/InputBool.vue";
import InputSelect from "../components/InputSelect.vue";
import InputFile from "../components/InputFile.vue";
import InputBoolFile from "../components/InputBoolFile.vue";
import InputBoolSelect from "../components/InputBoolSelect.vue";
import InputChip from "../components/InputChip.vue";
import InputSlide from "../components/InputSlide.vue";

export default {
  name: "Home",
  components: {
    InputChip,
    InputNumeric,
    InputBool,
    InputSelect,
    InputFile,
    InputBoolFile,
    InputBoolSelect,
    InputSlide,
  },
  computed: {
    services() {
      return this.$store.state.dada2Miseq;
    },
  },
  methods: {
    toggleExtra(index) {
      this.$store.commit("toggleExtra", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
      });
    },
  },
};
</script>

<style scoped>
.centered-input >>> input {
  text-align: center;
}
.v-card {
  height: 145px;
}
span {
  width: 34px;
}
.container {
  padding: 0;
}
</style>
