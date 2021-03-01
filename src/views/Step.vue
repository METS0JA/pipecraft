<template>
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
              v-for="input in service.numericInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      >{{ input.name }}</v-card-title
                    >
                  </template>
                  <span>{{ input.tooltip }}</span>
                </v-tooltip>
                <v-card-actions style="justify-content:center;">
                  <v-row
                    ><v-col
                      @change="formUpdate(index)"
                      style="padding:0;"
                      cols="6"
                      offset="3"
                    >
                      <v-text-field
                        style="padding-top:10%"
                        v-model="input.value"
                        type="number"
                        class="centered-input"
                        background-color="transparent"
                        :rules="numberRules"
                        solo
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- booleanInputs -->
            <v-col
              v-for="input in service.booleanInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      >{{ input.name }}</v-card-title
                    >
                  </template>
                  <span>{{ input.tooltip }}</span>
                </v-tooltip>
                <v-card-actions style="justify-content:center;">
                  <v-row style="justify-content:center;"
                    ><v-col style="padding:0;" cols="6" offset="4">
                      <v-switch
                        style="padding-top:10%;"
                        @change="formUpdate(index)"
                        v-model="input.value"
                        color="teal accent-3"
                      ></v-switch>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- selectInputs -->
            <v-col
              v-for="input in service.selectInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      >{{ input.name }}</v-card-title
                    >
                  </template>
                  <span>{{ input.tooltip }}</span>
                </v-tooltip>
                <v-card-actions style="justify-content:center;">
                  <v-row style="justify-content:center;"
                    ><v-col style="padding:0;" cols="6" offset="0">
                      <v-select
                        style="padding-top:10%"
                        @change="formUpdate(index)"
                        v-model="input.value[0]"
                        :items="input.value"
                        outlined
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- fileInputs -->
            <v-col
              v-for="(input, i) in service.fileInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      >{{ input.name }}</v-card-title
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
                              v-model="input.value"
                              class="centered-input"
                              background-color="transparent"
                              solo
                            ></v-text-field>
                          </div>
                          <v-btn
                            @click="fileSelect(index, i, 'fileInputs')"
                            style="justify-content:center; max-width:100px; border-top-right-radius:0; border-top-left-radius:0;"
                            block
                            >{{ input.btnName }}</v-btn
                          >
                        </template>
                        <span>{{ input.value }}</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- booleanFileInputs -->
            <v-col
              v-for="(input, i) in service.booleanFileInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      ><v-checkbox
                        @change="formUpdate(index)"
                        hide-details
                        class="ma-0 pa-0"
                        style="padding:0"
                        v-model="input.active"
                      >
                        <template v-slot:label>
                          <div style="color:black">
                            {{ input.name }}
                          </div>
                        </template></v-checkbox
                      >
                    </v-card-title>
                  </template>
                  <span>{{ input.tooltip }}</span>
                </v-tooltip>
                <v-card-actions style="justify-content:center;">
                  <v-row>
                    <v-col style="padding:0;" cols="8" offset="2">
                      <v-tooltip right>
                        <template v-slot:activator="{ on }">
                          <div v-on="on">
                            <v-text-field
                              disabled
                              style="border-bottom-right-radius: 0; border-bottom-left-radius:0;"
                              hide-details="true"
                              v-model="input.value"
                              class="centered-input"
                              background-color="transparent"
                              solo
                            ></v-text-field>
                          </div>
                          <v-btn
                            elevation="1"
                            :disabled="!input.active"
                            @click="fileSelect(index, i, 'booleanFileInputs')"
                            style="justify-content:center; max-width:100px; border-top-right-radius:0; border-top-left-radius:0;"
                            block
                            >{{ input.btnName }}</v-btn
                          >
                        </template>
                        <span>{{ input.value }}</span>
                      </v-tooltip>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- booleanSelectInputs -->
            <v-col
              v-for="input in service.booleanSelectInputs"
              :key="input.name"
              cols="12"
              xl="2"
              lg="3"
              md="4"
              sm="6"
              style="height:fit-content"
            >
              <v-card light elevation="2">
                <v-tooltip top>
                  <template v-slot:activator="{ on }">
                    <v-card-title
                      v-on="on"
                      style="justify-content:center; padding:10px 0px;"
                      ><v-checkbox
                        @change="formUpdate(index)"
                        hide-details
                        class="ma-0 pa-0"
                        style="padding:0"
                        v-model="input.active"
                      >
                        <template v-slot:label>
                          <div style="color:black">
                            {{ input.name }}
                          </div>
                        </template></v-checkbox
                      >
                    </v-card-title>
                  </template>
                  <span>{{ input.tooltip }}</span>
                </v-tooltip>
                <v-card-actions style="justify-content:center;">
                  <v-row style="justify-content:center;"
                    ><v-col style="padding:0;" cols="6" offset="0">
                      <v-select
                        :disabled="!input.active"
                        style="padding-top:10%"
                        @change="formUpdate(index)"
                        v-model="input.value[0]"
                        :items="input.value"
                        outlined
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
// import fileSelect from "../components/fileSelect.vue";
// import HelloWorld from "../components/HelloWorld.vue";
const { dialog } = require("electron").remote;

export default {
  name: "Home",
  data: () => ({
    isActive: true,
    numberRules: [(v) => isNaN(v) != true],
  }),
  components: {
    // HelloWorld,
  },
  computed: {
    services() {
      return this.$store.state.selectedSteps[this.$route.params.order].services;
    },
  },
  methods: {
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
    check_one(value, index) {
      this.$store.commit("checkService", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
        selected: value,
      });
      // this.services[index].selected = false;
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
</style>
