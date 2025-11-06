export type Tier = '★' | '★★' | '★★★' | null;

export type Option = {
  label: string;
  score: number;
  tier: Tier;
};

export type Question = {
  id: string;
  title: string;
  options: Option[];
};

export type Flow = {
  key: 'divorce' | 'inheritance' | 'labor';
  label: string;
  intro: string;
  questions: Question[];
  messages: {
    high: string;
    medium: string;
    low: string;
    reject: string;
  };
};

export type Schema = {
  accounts: { key: Flow['key']; label: string }[];
  flows: Record<Flow['key'], Flow>;
};
