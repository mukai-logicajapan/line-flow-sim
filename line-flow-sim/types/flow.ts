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

export type JudgeRules = {
  premium?: { doubleStarsAtLeast?: number; tripleStarsAtLeast?: number; starsAtLeast?: number };
  standard?: { starsBetween?: [number, number] };
  reject?: { stars?: number };
};

export type Flow = {
  key: 'divorce' | 'inheritance' | 'labor';
  label: string;
  intro: string;
  questions: Question[];
  judge: JudgeRules;
  messages: {
    premium: string;
    standard: string;
    reject: string;
  };
};

export type Schema = {
  accounts: { key: Flow['key']; label: string }[];
  flows: Record<Flow['key'], Flow>;
};
