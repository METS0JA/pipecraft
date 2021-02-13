<template>
  <v-row>
    <v-col
      v-for="input in serviceData"
      :key="input.name"
      cols="12"
      xl="2"
      lg="3"
      md="4"
      sm="6"
      style="height:fit-content"
    >
      <v-card light elevation="2">
        <v-card-title style="justify-content:center; padding:10px 0px;">{{
          input.name
        }}</v-card-title>
        <v-card-actions style="justify-content:center;">
          <v-row
            ><v-col style="padding:0;" cols="6" offset="3">
              <v-text-field
                @change="formUpdate($event)"
                :value="input.value"
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
    <!-- <v-col
      v-for="input in x"
      :key="input.name"
      cols="12"
      xl="2"
      lg="3"
      md="4"
      sm="6"
      style="height:fit-content"
    >
      <v-card light elevation="2">
        <v-card-title style="justify-content:center; padding:10px 0px;">{{
          input.name
        }}</v-card-title>
        <v-card-actions style="justify-content:center;">
          <v-row
            ><v-col style="padding:0;" cols="6" offset="3">
              <v-switch v-model="input.value" color="teal accent-3"></v-switch>
            </v-col>
          </v-row>
        </v-card-actions>
      </v-card>
    </v-col> -->
    <!-- <v-col
      v-for="input in y"
      :key="input.name"
      cols="12"
      xl="2"
      lg="3"
      md="4"
      sm="6"
      style="height:fit-content"
    >
      <v-card light elevation="2">
        <v-card-title style="justify-content:center; padding:10px 0px;">{{
          input.name
        }}</v-card-title>
        <v-card-actions style="justify-content:center;">
          <v-row
            ><v-col style="padding:0;" cols="6" offset="3">
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
    </v-col> -->
  </v-row>
</template>

<script>
export default {
  name: "Inputs",
  data: () => ({
    numberRules: [(v) => isNaN(v) != true],
  }),
  computed: {
    serviceData() {
      return this.$store.state.selectedSteps[this.$route.params.order].services[
        this.$attrs.index
      ].numericInputs;
    },
  },
  methods: {
    formUpdate(value) {
      console.log(value);
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
