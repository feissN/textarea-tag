<template>
  <div
    v-if="tagPopoverPosition"
    class="fixed p-2 bg-red-400"
    :style="{
      left: `${tagPopoverPosition.x}px`,
      top: `${tagPopoverPosition.y}px`,
    }"
  >
    Hello
  </div>

  <div ref="textareaWrapperRef">
    <textarea
      class="outline resize"
      :placeholder="'Enter some text...'"
      :value="modelValue"
      @input="handleUpdate($event as InputEvent)"
    ></textarea>
  </div>
  <div>
    {{ tagPopoverPosition }}
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:model-value", value: string): void;
}>();

const textareaWrapperRef = ref<HTMLDivElement>();
const tagPopoverPosition = ref<{ x: number; y: number } | null>(null);

const getCursorXY = (input: HTMLInputElement | HTMLTextAreaElement, selectionPoint?: number) => {
  const { offsetLeft: inputX, offsetTop: inputY } = input;
  const div = document.createElement("div");
  const copyStyle = getComputedStyle(input);
  for (const prop of copyStyle) {
    // @ts-expect-error ts is getting confused
    div.style[prop] = copyStyle[prop];
  }
  div.style.position = "absolute";
  const swap = ".";
  const inputValue = input.tagName === "INPUT" ? input.value.replace(/ /g, swap) : input.value;
  const textContent = inputValue.substring(0, selectionPoint);
  div.textContent = textContent;
  if (input.tagName === "TEXTAREA") div.style.height = "auto";
  if (input.tagName === "INPUT") div.style.width = "auto";
  const span = document.createElement("span");
  span.textContent = selectionPoint ? inputValue.substring(selectionPoint) || "." : ".";
  div.appendChild(span);
  textareaWrapperRef.value!.appendChild(div);
  const { offsetLeft: spanX, offsetTop: spanY } = span;
  textareaWrapperRef.value!.removeChild(div);
  return {
    x: inputX + spanX,
    y: inputY + spanY,
  };
};

const handleUpdate = (event: InputEvent) => {
  const target = event.target as HTMLTextAreaElement;

  if (event.data === "@" || tagPopoverPosition.value) {
    tagPopoverPosition.value = getCursorXY(target);
  }

  if (event.inputType === "insertLineBreak" && tagPopoverPosition.value) {
    console.log("tagging");
    tagPopoverPosition.value = null;
    event.preventDefault();
    event.stopPropagation();
    return;
  }

  emit("update:model-value", target.value);
};
</script>
