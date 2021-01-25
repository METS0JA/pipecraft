<template>
  <draggable
    class="list-group"
    tag="ul"
    v-bind="dragOptions"
    :move="onMove"
    @start="isDragging = true"
    @end="isDragging = false"
  >
    <transition-group type="transition" :name="'flip-list'">
      <li
        class="list-group-item"
        v-for="(element, index) in selectedSteps"
        :key="element.order"
      >
        <v-btn block color="grey">
          {{ element.stepName }}
          <v-icon @click="removeAt(index)">mdi-close-box</v-icon>
        </v-btn>
      </li>
    </transition-group>
  </draggable>
</template>

<script>
import draggable from "vuedraggable";
export default {
  name: "SelectedRoutes",
  components: {
    draggable,
  },
  data() {
    return {
      editable: true,
      isDragging: false,
      delayedDragging: false,
    };
  },
  methods: {
    onMove({ relatedContext, draggedContext }) {
      const relatedElement = relatedContext.element;
      const draggedElement = draggedContext.element;
      return (
        (!relatedElement || !relatedElement.fixed) && !draggedElement.fixed
      );
    },
    removeAt(index) {
      this.selectedSteps.splice(index, 1);
      // router.removeRoute('about')
    },
  },
  computed: {
    selectedSteps() {
      return this.$store.state.selectedSteps;
    },
    dragOptions() {
      return {
        animation: 0,
        group: "description",
        disabled: !this.editable,
        ghostClass: "ghost",
      };
    },
  },
  watch: {
    isDragging(newValue) {
      if (newValue) {
        this.delayedDragging = true;
        return;
      }
      this.$nextTick(() => {
        this.delayedDragging = false;
      });
    },
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
