import type { JudgeRules, Option } from '@/types/flow';

export type Result = {
  stars: number;
  doubleStarCount: number;
  tripleStarCount: number;
};

export const calc = (choices: Option[]): Result => ({
  stars: choices.reduce((sum, choice) => sum + (choice?.score ?? 0), 0),
  doubleStarCount: choices.filter(choice => choice?.tier === '★★').length,
  tripleStarCount: choices.filter(choice => choice?.tier === '★★★').length,
});

export type JudgeResult = 'premium' | 'standard' | 'reject';

export const judge = (result: Result, rules: JudgeRules): JudgeResult => {
  if (rules.premium) {
    const okDouble =
      rules.premium.doubleStarsAtLeast == null || result.doubleStarCount >= rules.premium.doubleStarsAtLeast;
    const okTriple =
      rules.premium.tripleStarsAtLeast == null || result.tripleStarCount >= rules.premium.tripleStarsAtLeast;
    const okStars = rules.premium.starsAtLeast == null || result.stars >= rules.premium.starsAtLeast;
    if (okDouble && okTriple && okStars) return 'premium';
  }

  if (rules.standard?.starsBetween) {
    const [min, max] = rules.standard.starsBetween;
    if (result.stars >= min && result.stars <= max) return 'standard';
  }

  if (rules.reject?.stars === 0 && result.stars === 0) return 'reject';

  return 'standard';
};
