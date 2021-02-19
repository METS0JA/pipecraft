<template>
  <v-col
    v-for="input in service.fileInputs"
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
        <v-row style="justify-content:center;"
          ><v-col style="padding:0;" cols="6" offset="0">
            <v-file-input label="File input" outlined dense></v-file-input>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
export default {
  name: "Inputs",
  data: () => ({
    numberRules: [(v) => isNaN(v) != true],
  }),
  computed: {
    service() {
      return this.$store.state.selectedSteps[this.$route.params.order].services[
        this.$attrs.index
      ];
    },
  },
  methods: {
    selectUpdate() {
      console.log(this.$route.params.order);
      this.$store.commit("serviceInputUpdate", {
        stepIndex: this.$route.params.order,
        serviceIndex: this.$attrs.index,
        value: this.service,
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
  height: 125px;
}
span {
  width: 34px;
}
</style>
