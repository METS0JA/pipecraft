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
        ><v-col
          @change="inputUpdate(input.value)"
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
            solo
          ></v-text-field>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  computed: {
    input() {
      return this.$store.state.selectedSteps[this.$route.params.order].services[
        this.$attrs.serviceIndex
      ].Inputs[this.$attrs.inputIndex];
    },
  },
  methods: {
    inputUpdate(value) {
      this.$store.commit("inputUpdate", {
        stepIndex: this.$route.params.order,
        serviceIndex: this.$attrs.serviceIndex,
        inputIndex: this.$attrs.inputIndex,
        value: value,
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
