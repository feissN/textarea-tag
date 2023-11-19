export type TagMention = {
  id: string;
  value: string;
};

export type TagItem = {
  text: string;
  mentions: TagMention[];
};
