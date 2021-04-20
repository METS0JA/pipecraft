<template>
  <v-card
    light
    elevation="2"
    style="height: fit-content; resize:auto; min-height: 145px"
  >
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-card-title
          v-on="on"
          style="justify-content:center; padding:10px 0px; "
          >{{ input.name.replace(/_/g, " ") }}</v-card-title
        >
      </template>
      <span>{{ input.tooltip }}</span>
    </v-tooltip>
    <v-card-actions style="justify-content:center; ">
      <v-row style="height: fit-content; resize:auto;"
        ><v-col style="padding:0;" cols="10" offset="1">
          <v-combobox
            type="text"
            @change="inputUpdate(input.value)"
            append-icon=""
            deletable-chips
            small-chips
            multiple
            style="text-transform: uppercase"
            @keydown="IUPAC($event)"
            v-model="input.value"
          ></v-combobox>
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
      ][this.$attrs.list][this.$attrs.inputIndex];
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
    inputUpdate(value) {
      this.$store.commit("inputUpdate", {
        stepIndex: this.$route.params.order,
        serviceIndex: this.$attrs.serviceIndex,
        inputIndex: this.$attrs.inputIndex,
        listName: this.$attrs.list,
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
