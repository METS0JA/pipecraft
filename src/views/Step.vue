<template>
  <v-row justify="center" style="padding-top:20px">
    <v-expansion-panels dark multiple popout>
      <v-expansion-panel
        v-for="(element, index) in stepData.services"
        :key="index"
      >
        <v-expansion-panel-header>{{
          element.serviceName
        }}</v-expansion-panel-header>
        <v-expansion-panel-content>
          <v-row>
            <v-col
              v-for="something in element.booleanInputs"
              :key="something.name"
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
                  >{{ something.name }}</v-card-title
                >
                <v-card-actions style="justify-content:center;">
                  <v-row
                    ><v-col style="padding:0;" cols="6" offset="3">
                      <v-switch
                        v-model="something.value"
                        color="teal accent-3"
                      ></v-switch>
                    </v-col>
                  </v-row>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col
              v-for="something in element.numericInputs"
              :key="something.name"
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
                  >{{ something.name }}</v-card-title
                >
                <v-card-actions style="justify-content:center;">
                  <v-row
                    ><v-col style="padding:0;" cols="6" offset="3">
                      <v-text-field
                        v-model="something.value"
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
          </v-row>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-row>
</template>

<script>
export default {
  name: "Home",
  data: () => ({
    numberRules: [(v) => isNaN(v) != true],
  }),
  components: {},
  computed: {
    stepData() {
      return this.$store.state.selectedSteps[this.$route.params.order];
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
</style>
