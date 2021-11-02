<template>
  <v-card light elevation="2">
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-card-title
          v-on="on"
          style="justify-content:center; padding:10px 0px;"
          >{{ input.name.replace(/_/g, " ") }}</v-card-title
        >
      </template>
      <span>{{ input.tooltip }}</span>
    </v-tooltip>
    <v-card-actions style="justify-content:center;">
      <v-row
        ><v-col style="padding:0;" cols="8" offset="2">
          <v-tooltip right>
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-text-field
                  disabled
                  style="border-bottom-right-radius: 0; border-bottom-left-radius:0;"
                  hide-details="true"
                  v-model="fileName"
                  class="centered-input"
                  background-color="transparent"
                  solo
                ></v-text-field>
              </div>
              <v-btn
                @click="fileSelect()"
                style="justify-content:center; max-width:100px; border-top-right-radius:0; border-top-left-radius:0;"
                block
                >{{ input.btnName }}</v-btn
              >
            </template>
            <span>{{ fileName }}</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
var path = require("path");
const { dialog } = require("electron").remote;

export default {
  computed: {
    input() {
      if (this.$route.params.workflowName) {
        return this.$store.state[this.$route.params.workflowName][
          this.$attrs.serviceIndex
        ][this.$attrs.list][this.$attrs.inputIndex];
      } else {
        return this.$store.state.selectedSteps[this.$route.params.order]
          .services[this.$attrs.serviceIndex][this.$attrs.list][
          this.$attrs.inputIndex
        ];
      }
    },
    fileName() {
      var filename = path.parse(this.input.value).base;
      return filename;
    },
  },
  methods: {
    inputUpdate(value) {
      if (this.$route.params.workflowName) {
        this.$store.commit("premadeInputUpdate", {
          workflowName: this.$route.params.workflowName,
          serviceIndex: this.$attrs.serviceIndex,
          inputIndex: this.$attrs.inputIndex,
          listName: this.$attrs.list,
          value: value,
        });
      } else {
        this.$store.commit("inputUpdate", {
          stepIndex: this.$route.params.order,
          serviceIndex: this.$attrs.serviceIndex,
          inputIndex: this.$attrs.inputIndex,
          listName: this.$attrs.list,
          value: value,
        });
      }
    },
    fileSelect() {
      dialog
        .showOpenDialog({
          title: "Select input files",
          properties: ["multiSelections", "showHiddenFiles"],
        })
        .then((result) => {
          if (typeof result.filePaths[0] !== "undefined") {
            this.inputUpdate(result.filePaths[0]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
};
</script>

<style scoped>
.centered-input >>> input {
  text-align: center;
}
</style>
