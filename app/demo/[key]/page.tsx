"use client";
import { notFound } from 'next/navigation';
import { useMemo, useState } from 'react';

import AccountTabs from '@/components/AccountTabs';
import ScorePanel from '@/components/ScorePanel';
import schema from '@/data/flow.schema.json';
import type { Flow, Option, Schema } from '@/types/flow';

import ChatFlow from './ChatFlow';
import { calc, judge } from '@/lib/score';

const data = schema as Schema;

type Props = {
  params: { key: Flow['key'] };
};

export default function DemoPage({ params }: Props) {
  const flow = data.flows[params.key];

  if (!flow) {
    notFound();
  }

  const [answers, setAnswers] = useState<Record<string, Option | null>>(
    () => Object.fromEntries(flow.questions.map(q => [q.id, null] as const)),
  );

  const handleChange = (qId: string, option: Option) => setAnswers(prev => ({ ...prev, [qId]: option }));

  const selections = useMemo(
    () =>
      flow.questions.map(q => ({
        questionId: q.id,
        questionTitle: q.title,
        option: answers[q.id] ?? null,
      })),
    [answers, flow],
  );

  const selectedOptions = useMemo(
    () => selections.map(s => s.option).filter((o): o is Option => Boolean(o)),
    [selections],
  );

  const result = useMemo(() => calc(selectedOptions), [selectedOptions]);
  const judgeResult = useMemo(() => judge(result), [result]);

  const isLabor = flow.key === 'labor';

  return (
    <main className="container demo-page">
      <AccountTabs accounts={data.accounts} activeKey={flow.key} />
      <div className={`demo-layout ${isLabor ? 'demo-layout-no-sidebar' : ''}`}>
        <div className="demo-left">
          <ChatFlow flow={flow} value={answers} onChange={handleChange} />
        </div>
        {!isLabor && (
          <ScorePanel flow={flow} selections={selections} result={result} judgeResult={judgeResult} />
        )}
      </div>
    </main>
  );
}
