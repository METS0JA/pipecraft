<template>
  <draggable
    class="list-group"
    v-model="selectedSteps"
    @start="drag = true"
    @end="drag = false"
  >
    <transition-group type="transition" :name="'flip-list'">
      <li
        v-for="(element, index) in selectedSteps"
        class="list-group-item"
        :key="element.route"
      >
        <v-btn block color="grey" @click="push2route(element.route)">
          {{ element.stepName }}
          <v-icon @click="removeAt(index, element.route)">mdi-close-box</v-icon>
        </v-btn>
      </li>
    </transition-group>
  </draggable>
</template>

<script>
// import About from "../views/About";
import draggable from "vuedraggable";
export default {
  components: {
    draggable,
  },
  computed: {
    selectedSteps: {
      get() {
        return this.$store.state.selectedSteps;
      },
      set(value) {
        this.$store.commit("DraggableUpdate", value);
      },
    },
  },
  methods: {
    removeAt(index, route) {
      console.log(route);
      this.$store.commit("removeStep", index);
    },
    push2route(route) {
      if (this.$route.path != route) {
        this.$router.push(route);
      }
    },
    // removeRoute: function(index, route) {
    //   console.log(route, index);
    //   this.$router.removeRoute("midaiganes");
    // },
  },
};
</script>

<style>
.flip-list-move {
  transition: transform 0.5s;
}
.no-move {
  transition: transform 0s;
}
.ghost {
  opacity: 0.5;
  background: whitesmoke;
}
.list-group {
  min-height: 20px;
  padding: 0;
}
.list-group-item {
  cursor: pointer;
  padding-top: 10px;
}
.list-group-item i {
  cursor: pointer;
}
li {
  list-style: none;
}
ul.list-group {
  padding-left: 0;
}
.v-btn {
  justify-content: space-between;
}
.v-btn:not(.v-btn--round).v-size--default {
  padding: 0 10px;
}
</style>
