<template>
  <div class="p-8 flex flex-col gap-4">
    <button @click="clear">Clear</button>
    <QuillTag
      ref="quillTagRef"
      v-model="tags"
      :remote-search="searchUsers"
      :placeholder="'Schreibe dein Kommentar... (@ um Nutzer zu markieren)'"
    />

    <div>Text:</div>
    <pre>{{ tags.text }}</pre>

    <div>Users:</div>
    <pre>{{ tags.mentions }}</pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import QuillTag from "./components/QuillTag.vue";
import { TagItem, TagMention } from "./types/tag";

const quillTagRef = ref<InstanceType<typeof QuillTag>>();

const tags = ref<TagItem>({
  text: "Hello @Lydia Rose and now @Sammy White ",
  mentions: [
    {
      id: "lydR",
      value: "Lydia Rose",
    },
    {
      id: "samW",
      value: "Sammy White",
    },
  ],
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const clear = () => {
  quillTagRef.value?.clear();
};

const searchUsers = async (text: string) => {
  await sleep(500);

  return [
    { id: "lydR", value: "Lydia Rose" },
    { id: "augB", value: "August Bloosh" },
    { id: "samR", value: "Samantha Reddish" },
    { id: "samW", value: "Sammy White" },
  ] as TagMention[];
};
</script>
