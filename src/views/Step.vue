<template>
  <v-row justify="center" style="padding-top:20px">
    <v-expansion-panels dark multiple popout>
      <v-expansion-panel v-for="(service, index) in services" :key="index">
        <v-expansion-panel-header style="padding-left: 45%">
          {{ service.serviceName }}
          <v-checkbox
            @change="check_one($event, index)"
            @click.stop
            v-model="service.selected"
            style="max-width:34px; padding-left:10px"
          ></v-checkbox>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
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
                <v-card-title
                  style="justify-content:center; padding:10px 0px;"
                  >{{ input.name }}</v-card-title
                >
                <v-card-actions style="justify-content:center;">
                  <v-row
                    ><v-col
                      @change="formUpdate(index)"
                      style="padding:0;"
                      cols="6"
                      offset="3"
                    >
                      <v-text-field
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
                <v-card-title
                  style="justify-content:center; padding:10px 0px;"
                  >{{ input.name }}</v-card-title
                >
                <v-card-actions style="justify-content:center;">
                  <v-row style="justify-content:center;"
                    ><v-col style="padding:0;" cols="6" offset="3">
                      <v-switch
                        @change="formUpdate(index)"
                        v-model="input.value"
                        color="teal accent-3"
                      ></v-switch>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
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
                <v-card-title
                  style="justify-content:center; padding:10px 0px;"
                  >{{ input.name }}</v-card-title
                >
                <v-card-actions style="justify-content:center;">
                  <v-row style="justify-content:center;"
                    ><v-col style="padding:0;" cols="6" offset="0">
                      <v-select
                        @change="formUpdate()"
                        v-model="input.value[0]"
                        :items="input.value"
                        outlined
                      ></v-select>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <!-- <HelloWorld :index="index" /> -->
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
// import fileSelect from "../components/fileSelect.vue";
// import HelloWorld from "../components/HelloWorld.vue";

export default {
  name: "Home",
  data: () => ({
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
    formUpdate(index) {
      this.$store.commit("serviceInputUpdate", {
        stepIndex: this.$route.params.order,
        serviceIndex: index,
        value: this.services[index],
      });
    },
    check_one(value, index) {
      console.log(value);
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
  height: 125px;
}
span {
  width: 34px;
}
</style>
