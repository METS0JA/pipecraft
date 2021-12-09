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
      <span>{{  input.tooltip }}</span>
    </v-tooltip>
    <v-card-actions style="justify-content:center;">
      <v-row style="justify-content:center;"
        ><v-col style="padding:0;" cols="8" offset="0">
          <v-select
            v-model="input.value"
            style="padding-top:10%"
            @change="inputUpdate(input.value)"
            :items="input.items"
            outlined
          ></v-select>
        </v-col>
      </v-row>
    </v-card-actions>
  </v-card>
</template>

<script>
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
  },
};
</script>

<style lang="scss" scoped>
  .v-text-field {
    ::v-deep input {
      text-align:center !important
    }
  }
  .v-text-field input {
    text-align: center;
}
</style>
