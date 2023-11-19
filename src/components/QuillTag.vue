<template>
  <QuillEditor
    class="border"
    ref="editorRef"
    :modules="quillModules"
    :placeholder="placeholder"
    :theme="''"
    @text-change="handleTextChange"
  />
</template>

<script setup lang="ts">
import { QuillEditor, Quill } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";

// @ts-expect-error missing types
import QuillMention from "quill-mention";
import "quill-mention/dist/quill.mention.css";

import { onMounted, ref } from "vue";
import { TagItem, TagMention } from "../types/tag";

const MentionBlot = Quill.import("blots/mention");
const mentionBlotName = "styled-mention";

class StyledMentionBlot extends MentionBlot {
  static blotName = mentionBlotName;

  static render(data: TagMention) {
    const anchor = document.createElement("a");
    anchor.href = `https://www.google.com/search?q=${data.id}`;
    anchor.innerText = data.value;
    anchor.target = "_blank";

    anchor.addEventListener("click", (event) => {
      event.stopPropagation();
    });

    return anchor;
  }

  static create(data: TagMention) {
    const node = super.create(data);
    node.contentEditable = "false";
    return node;
  }
}
Quill.register(StyledMentionBlot);

const props = defineProps<{
  modelValue: TagItem;
  remoteSearch: (text: string) => Promise<TagMention[]>;
  placeholder?: string;
}>();

const emit = defineEmits<{
  (event: "update:model-value", value: TagItem): void;
}>();

const editorRef = ref<InstanceType<typeof QuillEditor> | null>();

const quillModules = ref([
  {
    module: QuillMention,
    name: "QuillMention",
    options: {
      allowedChars: /^[A-Za-z\sÅÄÖåäö]*$/,
      mentionDenotationChars: ["@"],
      positioningStrategy: "fixed",
      renderLoading: () => {
        return "Nutzer werden geladen...";
      },
      source: async (searchTerm: string, renderList: (result: TagMention[]) => void) => {
        const matchedPeople = await props.remoteSearch(searchTerm);
        renderList(matchedPeople);
      },
      dataAttributes: ["id", "value", "denotationChar", "link", "target", "disabled", "color"],
      blotName: mentionBlotName,
    },
  },
]);

type StyledMention = {
  [mentionBlotName]: {
    id: string;
    value: string;
  };
};

const handleTextChange = () => {
  if (!editorRef.value) return;

  const rawContents = editorRef.value.getContents();
  if (!rawContents) return;
  if (typeof rawContents === "string") return;
  const allItems: (string | StyledMention)[] = Object.values(rawContents)[0].map((item: { insert: StyledMention | string }) => item.insert);
  const mentionItems = allItems.filter((item) => typeof item !== "string") as StyledMention[];

  emit("update:model-value", {
    text: editorRef.value.getQuill().container.innerText,
    mentions: mentionItems.map((item) => {
      return {
        id: item[mentionBlotName].id,
        value: item[mentionBlotName].value,
      };
    }),
  });
};
interface TextSegment {
  type: "text";
  value: string;
}

interface TagSegment {
  type: "tag";
  value: TagMention;
}

type ArraySegment = TextSegment | TagSegment;

function createArrayWithTypes(text: string, data: TagMention[]): ArraySegment[] {
  const result: ArraySegment[] = [];
  let remainingText: string = text;

  data.forEach(({ id, value }: TagMention) => {
    const tagRegex = new RegExp(`@${value}`, "g");
    const splitText = remainingText.split(tagRegex);

    if (splitText.length > 1) {
      result.push({ type: "text", value: splitText[0] });
      result.push({ type: "tag", value: { id, value } });
      remainingText = remainingText.slice(splitText[0].length + value.length + 1);
    }
  });

  if (remainingText) {
    result.push({ type: "text", value: remainingText });
  }

  return result;
}

const clear = () => {
  if (!editorRef.value) return;

  editorRef.value.getQuill().setContents([]);
};

defineExpose({
  clear,
});

onMounted(() => {
  if (!editorRef.value) return;

  const text = props.modelValue.text;
  const mentions = [...props.modelValue.mentions];

  const resultArray = createArrayWithTypes(text, mentions);

  editorRef.value.getQuill().setContents(
    resultArray.map((result, index) => {
      return {
        insert:
          result.type === "text"
            ? result.value
            : {
                [mentionBlotName]: {
                  denotationChar: "@",
                  id: result.value.id,
                  index,
                  value: result.value.value,
                },
              },
      };
    })
  );
});
</script>

<style lang="scss">
.ql-container {
  .mention {
    background-color: lightgreen;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
}

.ql-mention-list-item {
  &.ql-mention-list-item.selected {
    background-color: lightgreen;
  }
}
</style>
