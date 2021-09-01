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
            >{{ $route.params.workflowName.replace(/_/g, " ") }}</v-card-title
          >
        </template>
        <span>tip me please</span>
      </v-tooltip>
      <v-card-text
        class="pr-15 pl-15 text-center"
        style="justify-content:center;"
        >{{
          this.$store.state.customWorkflowInfo[$route.params.workflowName].info
        }}<br />
        <a
          :href="
            this.$store.state.customWorkflowInfo[$route.params.workflowName]
              .link
          "
          target="_blank"
          >{{
            this.$store.state.customWorkflowInfo[$route.params.workflowName]
              .link
          }}</a
        ></v-card-text
      >
    </v-card>
    <v-expansion-panels dark multiple popout>
      <v-overlay
        z-index="2"
        opacity="0.6"
        absolute
        :value="this.$store.state.loader.active"
      >
        <v-progress-circular
          :size="70"
          :width="7"
          color="purple"
          indeterminate
          >{{ `${this.$store.state.loader.index}%` }}</v-progress-circular
        >
      </v-overlay>
      <v-expansion-panel v-for="(service, index) in services" :key="index">
        <v-expansion-panel-header
          style="justify-content:center;"
          :class="[service.selected]"
        >
          <v-checkbox
            v-if="service.selected != 'always'"
            hide-details="true"
            @change="check_one($event, index)"
            @click.stop
            v-model="service.selected"
            style="max-width:34px; padding-top:0; margin:0"
          ></v-checkbox>
          {{ service.serviceName.toUpperCase() }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col
              v-for="(input, i) in service.Inputs"
              :key="input.name"
              cols="12"
              :xl="input.type === 'combobox' ? 4 : 2"
              :lg="input.type === 'combobox' ? 6 : 3"
              :md="input.type === 'combobox' ? 8 : 4"
              :sm="input.type === 'combobox' ? 12 : 3"
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
              <v-container v-if="input.type === 'combobox'"
                ><InputCombo
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
              <v-container v-if="input.type === 'combobox'"
                ><InputCombo
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
import InputCombo from "../components/InputCombo.vue";

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
    InputCombo,
  },
  computed: {
    services() {
      return this.$store.state[this.$route.params.workflowName];
    },
  },
  methods: {
    toggleExtra(index) {
      this.$store.commit("toggleExtraCustomWorkflow", {
        workflowName: this.$route.params.workflowName,
        serviceIndex: index,
      });
    },
    check_one(value, index) {
      this.$store.commit("checkCustomService", {
        serviceIndex: index,
        selected: value,
        name: this.$route.params.workflowName,
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
.always {
  padding-left: 58px;
}
</style>
