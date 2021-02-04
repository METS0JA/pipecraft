<template>
  <div class="home">
    <span>{{ $route.params.stepName }}</span>
    <span>{{ $route.params.order }}</span>
  </div>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";

export default {
  name: "Home",
  components: {
    // HelloWorld,
  },
};
</script>
