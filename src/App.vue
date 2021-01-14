<template>
  <v-app>
    <v-navigation-drawer app clipped width="250" permanent dark>
      <leftNav />
      <SelectedRoutes />
    </v-navigation-drawer>

    <v-navigation-drawer app clipped right permanent width="70" dark>
      <rightNav />
    </v-navigation-drawer>

    <v-main>
      <SelectedRoutes />
    </v-main>
  </v-app>
</template>

<script>
// import HelloWorld from "./components/HelloWorld";
import leftNav from "./components/leftNav";
import rightNav from "./components/rightNav";
import SelectedRoutes from "./components/SelectedRoutes";

export default {
  theme: { dark: true },
  name: "App",

  components: {
    // HelloWorld,
    leftNav,
    rightNav,
    SelectedRoutes,
  },

  data: () => ({
    //
  }),
};
</script>
