import type { Option } from '@/types/flow';

export type Result = {
  stars: number;
  singleStarCount: number;
  doubleStarCount: number;
  tripleStarCount: number;
};

export const calc = (choices: Option[]): Result => {
  const stars = choices.reduce((sum, choice) => sum + (choice?.score ?? 0), 0);
  const singleStarCount = choices.filter(choice => choice?.tier === '★').length;
  const doubleStarCount = choices.filter(choice => choice?.tier === '★★').length;
  const tripleStarCount = choices.filter(choice => choice?.tier === '★★★').length;

  return {
    stars,
    singleStarCount,
    doubleStarCount,
    tripleStarCount,
  };
};

export type JudgeResult = 'high' | 'medium' | 'low' | 'reject';

export const judge = (result: Result): JudgeResult => {
  if (result.tripleStarCount >= 3) return 'high';
  if (result.doubleStarCount >= 2) return 'medium';
  if (result.stars === 0) return 'reject';
  if (result.singleStarCount <= 1) return 'low';
  return 'low';
};
