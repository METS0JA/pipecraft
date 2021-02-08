<style scoped>
.centered-input >>> input {
  text-align: center;
}
</style>

<template>
  <v-row
    ><v-col style="padding:0;" cols="6" offset="3">
      <v-text-field
        type="number"
        class="centered-input"
        background-color="transparent"
        :rules="numberRules"
        solo
      ></v-text-field>
    </v-col>
  </v-row>
</template>

<script>
export default {
  name: "TextField",
  data: () => ({
    numberRules: [(v) => isNaN(v) != true],
  }),
};
</script>
