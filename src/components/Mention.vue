<template>
  <div ref="mentionContainerRef" :value="modelValue" @input="handleUpdate($event as InputEvent)" :contenteditable="true"></div>
</template>

<script setup lang="ts">
import Tribute from "tributejs";
import { nextTick, onMounted, ref } from "vue";
import { MentionItem } from "../types/mention";

const props = defineProps<{
  modelValue: MentionItem;
  remoteSearch: (text: string, cb: (result: any[]) => void) => void;
}>();

const emit = defineEmits<{
  (event: "update:model-value", value: MentionItem): void;
}>();

const tribute = ref<Tribute<MentionItem["mentions"][number]> | null>(null);

const mentionContainerRef = ref<HTMLDivElement | null>(null);

const handleUpdate = (event: InputEvent) => {
  const target = event.target as HTMLDivElement;
  emit("update:model-value", {
    ...props.modelValue,
    text: target.innerText,
    html: target.innerHTML,
  });
};

onMounted(() => {
  if (!mentionContainerRef.value) return;

  mentionContainerRef.value.innerHTML = props.modelValue.html;

  tribute.value = new Tribute({
    values: (text, cb) => {
      props.remoteSearch(text, cb);
    },
    lookup: "value",
    // See https://github.com/zurb/tribute/pull/490/files
    // loadingItemTemplate: `<div>Loading!</div>`,
    allowSpaces: true,
    selectClass: "highlight",
    containerClass: "tribute-container",
    itemClass: "tribute-item",
    menuItemTemplate: (item) => {
      return item.original.value;
    },
    selectTemplate: (item) => {
      if (!item?.original) return "";

      props.modelValue.mentions.push({
        id: item.original.id,
        key: item.original.key,
        value: item.original.value,
      });
      emit("update:model-value", props.modelValue);
      return `<span id="${item.original.id}" class="tagged-item" contenteditable="false">@${item.original.value}</span>`;
    },
  });

  tribute.value.attach(mentionContainerRef.value);

  const spanMutationObserver = new MutationObserver((mutationRecords) => {
    mutationRecords.forEach((mutationRecord) => {
      if (!mutationRecord.removedNodes?.length) return;

      mutationRecord.removedNodes.forEach((removedNode) => {
        if (!("id" in removedNode)) return;
        const foundMentionInModelValue = props.modelValue.mentions.findIndex((mention) => mention.id === removedNode.id);
        if (foundMentionInModelValue === -1) return;

        props.modelValue.mentions.splice(foundMentionInModelValue, 1);

        nextTick(() => {
          emit("update:model-value", props.modelValue);
        });
      });
    });
  });

  spanMutationObserver.observe(mentionContainerRef.value, { childList: true });
});
</script>

<style lang="scss">
.tribute-container {
  background-color: lightgray;

  .tribute-item {
    padding: 0.5rem;
    cursor: pointer;

    &.highlight {
      background-color: lightblue;
    }
  }
}

.tagged-item {
  background-color: aquamarine;
  user-select: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}
</style>
