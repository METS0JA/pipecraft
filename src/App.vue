<template>
  <v-app>
    <v-navigation-drawer app clipped width="250" permanent dark>
      <leftNav />
      <!-- <SelectedRoutes /> -->
    </v-navigation-drawer>

    <v-navigation-drawer app clipped right permanent width="70" dark>
      <rightNav />
    </v-navigation-drawer>

    <v-main style="background-color:#9e9e9e">
      <transition name="slide-fade">
        <router-view />
      </transition>
    </v-main>
  </v-app>
</template>

<script>
// import HelloWorld from "./components/HelloWorld";
import leftNav from "./components/leftNav";
import rightNav from "./components/rightNav";
// import SelectedRoutes from "./components/SelectedRoutes";

export default {
  theme: { dark: true },
  name: "App",

  components: {
    // HelloWorld,
    leftNav,
    rightNav,
    // SelectedRoutes,
  },

  data: () => ({
    //
  }),
};
</script>

<style>
.slide-fade-enter-active {
  transition: all 0.3s ease;
}
.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(10px);
  opacity: 0;
}
</style>
