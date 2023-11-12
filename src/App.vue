<template>
  <div class="p-8 flex flex-col gap-4" v-if="mentions">
    <Mention v-model="mentions" :remote-search="performSearch" class="border border-black p-1"> </Mention>

    <div>Text:</div>
    <pre>{{ mentions.text }}</pre>

    <div>html:</div>
    <div v-html="mentions.html"></div>

    <div>Users:</div>
    <pre>{{ mentions.mentions }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Mention from "./components/Mention.vue";
import { MentionItem } from "./types/mention";

const mentions = ref<MentionItem>({
  mentions: [
    {
      id: "f2850878-954c-4803-97b9-1f06f5d34568",
      key: "nf",
      value: "Sammy White",
    },
  ],
  text: "Hello! @Sammy White ",
  html: 'Hello! <span id="f2850878-954c-4803-97b9-1f06f5d34568" class="tagged-item" contenteditable="false">@Sammy White</span>&nbsp;',
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const performSearch = async (text: string, callback: (result: any[]) => void) => {
  console.log(text);

  //   await sleep(500);

  callback([
    { id: crypto.randomUUID(), key: "lr", value: "Lydia Rose" },
    { id: crypto.randomUUID(), key: "ab", value: "August Bloosh" },
    { id: crypto.randomUUID(), key: "sr", value: "Samantha Reddish" },
    { id: crypto.randomUUID(), key: "sw", value: "Sammy White" },
  ]);
};
</script>
