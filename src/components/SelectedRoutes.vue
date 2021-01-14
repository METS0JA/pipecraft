<template>
  <v-list dense rounded three-line class="list1" style="height:fit-content">
    <drop-list
      :items="items1"
      @reorder="$event.apply(items1)"
      @insert="insert1"
      mode="cut"
    >
      <template v-slot:item="{ item, reorder }">
        <drag :key="item.title" :data="item" @cut="remove(items1, item)">
          <v-list-item
            :ripple="false"
            link
            style="background-color: transparent; min-height:48px;"
            :style="
              reorder
                ? {
                    borderBottom: '2px solid #1976D2',
                    marginLeft: '-2px',
                    backgroundColor: 'transparent',
                  }
                : {}
            "
          >
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon
              ><v-icon right @click="remove(items1, item)"
                >mdi-close-box</v-icon
              ></v-list-item-icon
            >
          </v-list-item>
        </drag>
      </template>
      <template v-slot:feedback="{ data }">
        <v-skeleton-loader
          :key="data.title"
          style="border-left: 2px solid #1976D2; margin-left: -2px;"
        />
      </template>
    </drop-list>
  </v-list>
</template>

<script>
import { Drag, DropList } from "vue-easy-dnd";

export default {
  name: "SelectedRoutes",
  components: {
    Drag,
    DropList,
  },
  data: function() {
    return {
      items1: [
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/1.jpg",
          title: "Brunch this weekend?",
          subtitle:
            "<span class='text--primary'>Ali Connors</span> &mdash; I'll be in your neighborhood doing errands this weekend. Do you want to hang out?",
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/2.jpg",
          title: "Summer BBQ",
          subtitle:
            "<span class='text--primary'>to Alex, Scott, Jennifer</span> &mdash; Wish I could come, but I'm out of town this weekend.",
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/3.jpg",
          title: "Oui oui",
          subtitle:
            "<span class='text--primary'>Sandra Adams</span> &mdash; Do you have Paris recommendations? Have you ever been?",
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/4.jpg",
          title: "Birthday gift",
          subtitle:
            "<span class='text--primary'>Trevor Hansen</span> &mdash; Have any ideas about what we should get Heidi for her birthday?",
        },
        {
          avatar: "https://cdn.vuetifyjs.com/images/lists/5.jpg",
          title: "Recipe to try",
          subtitle:
            "<span class='text--primary'>Britta Holt</span> &mdash; We should eat this: Grate, Squash, Corn, and tomatillo Tacos.",
        },
      ],
    };
  },
  methods: {
    insert1(event) {
      this.items1.splice(event.index, 0, event.data);
    },
    remove(array, value) {
      let index = array.indexOf(value);
      array.splice(index, 1);
    },
  },
};
</script>

<style>
.list1 {
  height: 100%;
}

.drop-allowed.drop-in * {
  cursor: inherit !important;
}
</style>
