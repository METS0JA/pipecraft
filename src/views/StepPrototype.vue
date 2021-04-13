<template>
  <!-- each sub component must recive -->
  <v-row justify="center" style="padding-top:20px">
    <v-expansion-panels dark multiple popout>
      <v-expansion-panel v-for="(service, index) in services" :key="index">
        <v-expansion-panel-header style="padding-left: 40%">
          <v-checkbox
            @change="check_one($event, index)"
            @click.stop
            v-model="service.selected"
            style="max-width:34px; padding-right:10px"
          ></v-checkbox
          >{{ service.serviceName }}
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <!-- numericInputs -->
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
                ><InputNumeric :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'bool'"
                ><InputBool :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'select'"
                ><InputSelect :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'file'"
                ><InputFile :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'boolfile'"
                ><InputBoolFile :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'boolselect'"
                ><InputBoolSelect :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'chip'"
                ><InputChip :serviceIndex="index" :inputIndex="i"
              /></v-container>
              <v-container v-if="input.type === 'slide'"
                ><InputSlide :serviceIndex="index" :inputIndex="i"
              /></v-container>
            </v-col>
          </v-row>
          <v-row justify="center">
            <v-btn
              light
              class="mt-5 mb-5"
              style="justify-content: center;"
              @click="toggleExtra($event, index)"
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
// import HelloWorld from "../components/HelloWorld.vue";
const { dialog } = require("electron").remote;

export default {
  name: "Home",
  data: () => ({
    isActive: true,
    rules: [
      (v) => v >= 0 || "value should be",
      (v) => v <= 100 || "Max should not be above £50,000",
    ],
    // numberRules: [(v) => (v < 0 ? true : false)],
    // numberRules: [(v) => isNaN(v) != true],
  }),
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
      return this.$store.state.selectedSteps[this.$route.params.order].services;
    },
  },
  methods: {
    IUPAC(event) {
      if (
        ![
          "Backspace",
          "Enter",
          "i",
          "a",
          "c",
          "g",
          "t",
          "r",
          "y",
          "s",
          "w",
          "k",
          "m",
          "b",
          "d",
          "h",
          "v",
          "n",
        ].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
    },
    fileSelect(index, i, type) {
      dialog
        .showOpenDialog({
          title: "Select input files",
          properties: ["multiSelections", "showHiddenFiles"],
        })
        .then((result) => {
          if (typeof result.filePaths[0] !== "undefined") {
            if (type == "booleanFileInputs") {
              this.services[index].booleanFileInputs[i].value =
                result.filePaths[0];
              this.formUpdate(index);
            } else if (type == "fileInputs") {
              this.services[index].fileInputs[i].value = result.filePaths[0];
              this.formUpdate(index);
            }
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    formUpdate(index) {
      this.$store.commit("serviceInputUpdate", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
        value: this.services[index],
      });
    },
    toggleExtra(event, index) {
      this.$store.commit("toggleExtra", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
      });
    },
    check_one(value, index) {
      this.$store.commit("checkService", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
        selected: value,
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
