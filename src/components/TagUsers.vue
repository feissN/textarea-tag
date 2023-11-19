<template>
  <textarea class="border border-black p-1" ref="textareaRef"></textarea>
  <!-- [[{"id":200, "value":"cartman", "title":"Eric Cartman"}]] and [[kyle]] do not know [[{"value":"homer simpson", "readonly":true}]] because he's a relic. -->

  <button @click="log">Log</button>
</template>

<script setup lang="ts">
import Tagify from "@yaireo/tagify";
import "@yaireo/tagify/dist/tagify.css";
import { onMounted, ref, watch } from "vue";
import { TagItem, TagMention } from "../types/tag";

const props = defineProps<{
  modelValue: TagItem;
  remoteSearch: (text: string) => Promise<TagMention[]>;
}>();

const emit = defineEmits<{
  (event: "update:model-value", value: TagItem): void;
}>();

const textareaRef = ref<HTMLTextAreaElement>();
const tagify = ref<Tagify<TagMention>>();

const handleAddTag = (event: CustomEvent<Tagify.AddEventData<TagMention>>) => {
  emit("update:model-value", {
    text: props.modelValue.text,
    mentions: event.detail.tagify.value,
  });
};

const handleRemoveTag = (event: CustomEvent<Tagify.RemoveEventData<TagMention>>) => {
  emit("update:model-value", {
    text: props.modelValue.text,
    mentions: event.detail.tagify.value,
  });
};

const initTagify = () => {
  if (!textareaRef.value) return;

  tagify.value = new Tagify<TagMention>(textareaRef.value, {
    mode: "mix",
    pattern: "@",
    tagTextProp: "value",
    enforceWhitelist: true,
    duplicates: false,
    placeholder: "Tag users with @",
    dropdown: {
      enabled: 1,
      position: "text",
      mapValueTo: "value",
      highlightFirst: true,
    },
    callbacks: {
      add: handleAddTag,
      remove: handleRemoveTag,
    },
  });

  tagify.value.on("input", async (event) => {
    const prefix = event.detail.prefix;
    const value = event.detail.value;
    const eventTagify = event.detail.tagify;

    emit("update:model-value", {
      text: event.detail.textContent,
      mentions: props.modelValue.mentions,
    });

    if (prefix === "@") {
      eventTagify.loading(true).dropdown.hide();
      eventTagify.whitelist = await props.remoteSearch(value);
      eventTagify.loading(false).dropdown.show(value);
    }
  });
};

const log = () => {
  console.log(tagify.value);
};

watch(
  () => props.modelValue,
  () => {
    console.log("Model update", props.modelValue);
  }
);

onMounted(() => {
  if (!textareaRef.value) return;
  textareaRef.value.innerHTML = props.modelValue.text;

  initTagify();
});
</script>
