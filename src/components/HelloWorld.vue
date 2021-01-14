<template>
  <v-expansion-panels>
    <v-expansion-panel
      v-for="item in this.$store.state.qualityFilter.services"
      :key="item.name"
    >
      <v-expansion-panel-header>
        {{ item.name }}
      </v-expansion-panel-header>
      <v-expansion-panel-content>
        <v-row>
          <v-col
            v-for="something in item.numericInputs"
            :key="something.title"
            cols="12"
            xl="2"
            lg="3"
            md="4"
            sm="6"
            style="height:fit-content"
          >
            <v-card elevation="2">
              <v-card-title style="justify-content:center; padding:10px 0px;">{{
                something.title
              }}</v-card-title>
              <v-card-actions style="justify-content:center;">
                <TextField />
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>
</template>

<script>
import TextField from "./TextField.vue";

export default {
  name: "HelloWorld",
  components: {
    TextField,
  },

  data: () => ({
    ecosystem: [
      {
        text: "vuetify-loader",
        href: "https://github.com/vuetifyjs/vuetify-loader",
      },
    ],
  }),
};
</script>
