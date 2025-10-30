'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Flow, Option } from '@/types/flow';

type Props = {
  flow: Flow;
  value: Record<string, Option | null>;
  onChange: (qId: string, option: Option) => void;
};

const ChatFlow = ({ flow, value, onChange }: Props) => {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [categoryConfirmed, setCategoryConfirmed] = useState(false);

  const messages = useMemo(() => {
    const msgs: Array<{ role: 'bot' | 'user'; id: string; text: string }> = [];
    if (!categoryConfirmed) {
      msgs.push({ role: 'bot', id: 'welcome', text: 'ご登録ありがとうございます！どちらの内容でご相談がありますか？' });
      return msgs;
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
    return msgs;
  }, [flow, value, categoryConfirmed]);

  const firstUnansweredIndex = useMemo(() => {
    return flow.questions.findIndex(q => !value[q.id]);
  }, [flow.questions, value]);

  const visibleIndex = firstUnansweredIndex === -1 ? flow.questions.length - 1 : firstUnansweredIndex;
  const currentQuestion = flow.questions[visibleIndex];
  const currentAnswered = !!value[currentQuestion.id];

  const handleSelect = (option: Option) => {
    onChange(currentQuestion.id, option);
    // Move to next question after answer
    if (visibleIndex < flow.questions.length - 1) setActiveIndex(visibleIndex + 1);
  };

  const handleCategory = (key: 'divorce' | 'inheritance' | 'labor') => {
    if (key === flow.key) {
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
    </div>
  );
};

export default ChatFlow;


