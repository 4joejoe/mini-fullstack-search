export interface FaqItem {
  id: number;
  title: string;
  body: string;
  score?: number;
}

export type SearchState = {
  results: FaqItem[];
  summary: string;
  sources: number[];
  msg: string;
};
