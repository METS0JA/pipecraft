<template>
  <v-card light elevation="2">
    <v-tooltip top>
      <template v-slot:activator="{ on }">
      <v-card-actions v-on="on" style="justify-content: center">
      <v-row
        ><v-col
          style="padding: 0"
          cols="10"
          offset="1"
        >
        <v-btn  @click="openLink(input.value)" style="margin-top: 30%" class="centered-input"  solo  block  :rules="input.rules ? input.rules : []"
        elevation="2"
      >{{input.name}}</v-btn>
    
        </v-col>
      </v-row>
    </v-card-actions>
      </template>
      <span>{{ input.tooltip }}</span>
    </v-tooltip>
   
  </v-card>
</template>

<script>
const { shell } = require('electron')
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
    openLink(value) {
      shell.openExternal(value)
    },
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
    text-align: center !important;
  }
}
.v-text-field input {
  text-align: center;
}
</style>
