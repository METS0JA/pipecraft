<template>
  <div>
    <v-img
      style="margin: auto; background:transparent"
      max-height="350"
      max-width="350"
      src="..\assets\PipeCraft2_logo.png"
    ></v-img>
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
<style lang="scss" scoped>
/* Cool infinite background scrolling animation.
 * Twitter: @kootoopas
 */

/* Exo thin font from Google. */
@import url(https://fonts.googleapis.com/css?family=Exo:100);

/* Background data (Original source: https://subtlepatterns.com/grid-me/) */
$bg-url: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAAJcEhZcwAACxMAAAsTAQCanBgAAACFSURBVGhD7dq7DQMxDMBQXabxxrnC23gJ7eJCcT5DUAEfYAhQJfaO+37W3rsiou1733/VMeeMMcbZ9ZSZcZ1Za63vprHHb7ZnCI0hNIbQGEJjCI0hNIbQGEJjCI0hNIbQGEJjCI0hNIbQGEJjCI0hNIbQGEJjCI0hNP8TUlWf/06dZWa8AJZ1Tf0j5ddzAAAAAElFTkSuQmCC";
$bg-width: 150px;
$bg-height: 150px;

/* Animations */
@-webkit-keyframes bg-scrolling-reverse {
  100% {
    background-position: $bg-width $bg-height;
  }
}
@-moz-keyframes bg-scrolling-reverse {
  100% {
    background-position: $bg-width $bg-height;
  }
}
@-o-keyframes bg-scrolling-reverse {
  100% {
    background-position: $bg-width $bg-height;
  }
}
@keyframes bg-scrolling-reverse {
  100% {
    background-position: $bg-width $bg-height;
  }
}

@-webkit-keyframes bg-scrolling {
  0% {
    background-position: $bg-width $bg-height;
  }
}
@-moz-keyframes bg-scrolling {
  0% {
    background-position: $bg-width $bg-height;
  }
}
@-o-keyframes bg-scrolling {
  0% {
    background-position: $bg-width $bg-height;
  }
}
@keyframes bg-scrolling {
  0% {
    background-position: $bg-width $bg-height;
  }
}

/* Main styles */
div {
  height: 100%;
  color: #999;
  font: 400 16px/1.5 exo, ubuntu, "segoe ui", helvetica, arial, sans-serif;
  text-align: center;
  padding-top: 100px;
  /* img size is 50x50 */
  background: url($bg-url) repeat 0 0;

  -webkit-animation: bg-scrolling-reverse 0.92s infinite; /* Safari 4+ */
  -moz-animation: bg-scrolling-reverse 0.92s infinite; /* Fx 5+ */
  -o-animation: bg-scrolling-reverse 0.92s infinite; /* Opera 12+ */
  animation: bg-scrolling-reverse 0.92s infinite; /* IE 10+ */
  -webkit-animation-timing-function: linear;
  -moz-animation-timing-function: linear;
  -o-animation-timing-function: linear;
  animation-timing-function: linear;

  &::before {
    content: "";

    font-size: 6rem;
    font-weight: 100;
    font-style: normal;
  }
}
</style>
