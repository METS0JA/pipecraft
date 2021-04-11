<template>
  <v-col
    v-for="input in service.booleanInputs.filter((x) => x.extra != true)"
    :key="input.name"
    cols="12"
    xl="2"
    lg="3"
    md="4"
    sm="6"
    style="height:fit-content"
  >
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
        <v-row style="justify-content:center;"
          ><v-col style="padding:0;" cols="6" offset="4">
            <v-switch
              style="padding-top:10%;"
              @change="formUpdate(index)"
              v-model="input.value"
              color="teal accent-3"
            ></v-switch>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
export default {};
</script>

<style></style>
