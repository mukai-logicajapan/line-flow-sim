'use client';

import { useMemo, useState } from 'react';

import QuestionCard from '@/components/QuestionCard';
import ScorePanel from '@/components/ScorePanel';
import ResultMessage from '@/components/ResultMessage';
import type { Flow, Option } from '@/types/flow';
import { calc, judge } from '@/lib/score';

type Props = {
  flow: Flow;
};

const FlowDemo = ({ flow }: Props) => {
  const [answers, setAnswers] = useState<Record<string, Option | null>>(() =>
    Object.fromEntries(flow.questions.map(question => [question.id, null] as const)),
  );

  const selections = useMemo(
    () =>
      flow.questions.map(question => ({
        questionId: question.id,
        questionTitle: question.title,
        option: answers[question.id] ?? null,
      })),
    [answers, flow],
  );

  const selectedOptions = useMemo(
    () => selections.map(selection => selection.option).filter((option): option is Option => Boolean(option)),
    [selections],
  );

  const result = useMemo(() => calc(selectedOptions), [selectedOptions]);
  const judgeResult = useMemo(() => judge(result, flow.judge), [result, flow.judge]);
  const isComplete = selections.every(selection => selection.option);

  const handleSelect = (questionId: string, option: Option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  return (
    <div className="demo-layout">
      <div className="demo-left">
        <section className="intro-card">
          <h1>{flow.label}</h1>
          <p className="intro-copy">{flow.intro}</p>
        </section>

        {flow.questions.map(question => (
          <QuestionCard
            key={question.id}
            question={question}
            selected={answers[question.id]}
            onSelect={option => handleSelect(question.id, option)}
          />
        ))}

        {isComplete ? <ResultMessage message={flow.messages[judgeResult]} /> : null}
      </div>

      <ScorePanel flow={flow} selections={selections} result={result} judgeResult={judgeResult} />
    </div>
  );
};

export default FlowDemo;
