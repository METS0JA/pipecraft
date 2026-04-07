<template>
  <v-card
    light
    elevation="2"
    :disabled="
      Object.values(inputData).includes(input.disabled) ||
      $store.state.runInfo.active == true ||
      $store.getters.check_depends_on(input) ||
      isConditionallyDisabled
    "
  >
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-card-title
          v-if="$store.getters.linkify(input.tooltip) !== null"
          v-on="on"
          style="justify-content: center; padding: 10px 0px"
        >
          <a :href="$store.getters.linkify(input.tooltip)" target="_blank">{{
            displayName
          }}</a></v-card-title
        >
        <v-card-title
          v-else
          v-on="on"
          style="justify-content: center; padding: 10px 0px"
          >{{ displayName }}</v-card-title
        >
      </template>
      <span>{{ input.tooltip }}</span>
    </v-tooltip>
    <v-card-actions style="justify-content: center">
      <v-row
        ><v-col
          @change="inputUpdate(input.value)"
          style="padding: 0"
          cols="6"
          offset="3"
        >
          <v-text-field
            style="padding-top: 10%"
            v-model="input.value"
            :type="input.type === 'text' ? 'text' : 'number'"
            class="centered-input"
            background-color="transparent"
            solo
            :rules="input.rules ? input.rules : []"
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
    inputData() {
      return this.$store.state.data;
    },
    displayName() {
      const name = this.input.displayName || this.input.name;
      return name.replace(/_/g, " ");
    },
    service() {
      if (this.$route.params.workflowName) {
        return this.$store.state[this.$route.params.workflowName][
          this.$attrs.serviceIndex
        ];
      } else {
        return this.$store.state.selectedSteps[this.$route.params.order]
          .services[this.$attrs.serviceIndex];
      }
    },
    isConditionallyDisabled() {
      // Check if this is a SWARM service
      if (this.service.serviceName !== "swarm") {
        return false;
      }

      // Get the d and fastidious values from the Inputs
      const swarmInputs = this.service.Inputs;
      const dValue = Number(swarmInputs[0]?.value ?? 1); // swarm_d is Inputs[0]
      const fastidiousValue = swarmInputs[2]?.value; // swarm_fastidious is Inputs[2]

      const inputName = this.input.name;

      // Fastidious options (boundary, ceiling, bloom_bits): disable if NOT (d=1 AND fastidious=true)
      if (
        ["swarm_boundary", "swarm_ceiling", "swarm_bloom_bits"].includes(
          inputName
        )
      ) {
        return !(dValue === 1 && fastidiousValue === true);
      }

      // Alignment options (match, mismatch, gap_open, gap_ext): disable if NOT (d>1)
      if (
        [
          "swarm_match",
          "swarm_mismatch",
          "swarm_gap_open",
          "swarm_gap_ext",
        ].includes(inputName)
      ) {
        return !(dValue > 1);
      }

      return false;
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
    text-align: center !important;
  }
}
.v-text-field input {
  text-align: center;
}
</style>
