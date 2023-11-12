export type MentionItem = {
  text: string;
  html: string;
  mentions: {
    id: string;
    key: string;
    value: string;
  }[];
};
