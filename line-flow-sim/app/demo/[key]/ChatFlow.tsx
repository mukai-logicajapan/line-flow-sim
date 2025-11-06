'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Flow, Option } from '@/types/flow';
import { calc, judge, type JudgeResult, type Result } from '@/lib/score';

type Props = {
  flow: Flow;
  value: Record<string, Option | null>;
  onChange: (qId: string, option: Option) => void;
};

const judgeLabels: Record<JudgeResult, string> = {
  high: '優先対応（高）',
  medium: '優先対応（中）',
  low: '優先対応（低）',
  reject: '案内不可',
};

const ChatFlow = ({ flow, value, onChange }: Props) => {
  const router = useRouter();
  const [categoryConfirmed, setCategoryConfirmed] = useState(false);
  const [categoryLabel, setCategoryLabel] = useState<string | null>(null);

  const selectedOptions = useMemo(
    () => flow.questions.map(q => value[q.id]).filter((opt): opt is Option => Boolean(opt)),
    [flow.questions, value],
  );

  const result: Result = useMemo(() => calc(selectedOptions), [selectedOptions]);
  const judgeResult: JudgeResult = useMemo(() => judge(result), [result]);
  const allAnswered = selectedOptions.length === flow.questions.length && flow.questions.length > 0;

  const messages = useMemo(() => {
    const msgs: Array<{ role: 'bot' | 'user'; id: string; text: string }> = [
      { role: 'bot', id: 'welcome', text: 'ご登録ありがとうございます！どちらの内容でご相談がありますか？' },
    ];

    if (!categoryConfirmed) {
      return msgs;
    }

    if (categoryLabel) {
      msgs.push({ role: 'user', id: 'category-selection', text: categoryLabel });
    }

    msgs.push({ role: 'bot', id: 'intro', text: flow.intro });

    // Build conversation history sequentially; stop at first unanswered question
    const qs = flow.questions;
    for (let i = 0; i < qs.length; i++) {
      const q = qs[i];
      const ans = value[q.id];
      msgs.push({ role: 'bot', id: `q:${q.id}`, text: q.title });
      if (ans) {
        msgs.push({ role: 'user', id: `a:${q.id}`, text: ans.label + (ans.tier ? `（${ans.tier}）` : '') });
      } else {
        // First unanswered question reached; do not append further questions yet
        break;
      }
    }

    if (allAnswered) {
      const summaryText = [
        'ご回答ありがとうございました！',
        `合計スコア：${result.stars}`,
        `★：${result.singleStarCount}`,
        `★★：${result.doubleStarCount}`,
        `★★★：${result.tripleStarCount}`,
        `判定：${judgeLabels[judgeResult]}`,
      ].join('\n');

      msgs.push({ role: 'bot', id: 'summary', text: summaryText });
      msgs.push({ role: 'bot', id: 'final', text: flow.messages[judgeResult] });
    }
    return msgs;
  }, [flow, value, categoryConfirmed, categoryLabel, allAnswered, judgeResult, result]);

  const firstUnansweredIndex = useMemo(() => {
    return flow.questions.findIndex(q => !value[q.id]);
  }, [flow.questions, value]);

  const visibleIndex = firstUnansweredIndex === -1 ? flow.questions.length - 1 : firstUnansweredIndex;
  const currentQuestion = flow.questions[visibleIndex];
  const currentAnswered = !!value[currentQuestion.id];

  const handleSelect = (option: Option) => {
    onChange(currentQuestion.id, option);
  };

  const handleCategory = (key: 'divorce' | 'inheritance' | 'labor') => {
    if (key === flow.key) {
      setCategoryLabel(flow.label);
      setCategoryConfirmed(true);
    } else {
      router.push(`/demo/${key}`);
    }
  };

  return (
    <div className="chat-wrap">
      <div className="chat-stream">
        {messages.map(msg => (
          <div key={msg.id} className={`bubble ${msg.role === 'bot' ? 'bubble-bot' : 'bubble-user'}`}>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Quick replies */}
      {!allAnswered && (
        <div className="quick-replies">
          {!categoryConfirmed ? (
            <>
              <button type="button" className="qr" onClick={() => handleCategory('divorce')}>不倫・離婚</button>
              <button type="button" className="qr" onClick={() => handleCategory('inheritance')}>相続・遺産</button>
              <button type="button" className="qr" onClick={() => handleCategory('labor')}>労働トラブル</button>
            </>
          ) : (
            currentQuestion.options.map(opt => (
              <button
                key={opt.label}
                type="button"
                className="qr"
                onClick={() => handleSelect(opt)}
                disabled={currentAnswered}
              >
                <span>{opt.label}</span>
                <span className="qr-score">+{opt.score}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ChatFlow;
