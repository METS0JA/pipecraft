<template>
  <v-list-item-group>
    <v-list-item v-for="(item, i) in items" :key="i">
      <v-list-item-content>
        <v-list-item-title
          v-text="item.text"
          style="text-align:center;"
        ></v-list-item-title>
      </v-list-item-content>
    </v-list-item>
  </v-list-item-group>
</template>

<script>
export default {
  data: () => ({
    items: [],
  }),
};
</script>
