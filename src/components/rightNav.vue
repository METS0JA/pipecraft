<template>
  <v-list dense rounded>
    <v-list-item>
      <v-list-item-content>
        <v-icon color="lime">
          {{ this.$store.state.icon }}
        </v-icon>
      </v-list-item-content>
    </v-list-item>

    <v-divider></v-divider>

    <v-list-item
      v-for="item in this.$store.state.leftNav"
      :key="item.title"
      link
    >
      <v-list-item-content>
        <v-icon>{{ item.icon }}</v-icon>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
export default {
  name: "rightNav",
  data() {
    return {
      // items: [
      //   { title: "Home", icon: "mdi-view-dashboard" },
      //   { title: "About", icon: "mdi-forum" },
      // ],
    };
  }
};
</script>
