'use client';

import type { Flow, Option } from '@/types/flow';
import type { JudgeResult, Result } from '@/lib/score';

type Selection = {
  questionId: string;
  questionTitle: string;
  option: Option | null;
};

type Props = {
  flow: Flow;
  selections: Selection[];
  result: Result;
  judgeResult: JudgeResult;
};

const judgeLabels: Record<JudgeResult, string> = {
  premium: 'プレミアム案件 想定',
  standard: '標準案件 想定',
  reject: '非対象 想定',
};

const ScorePanel = ({ flow, selections, result, judgeResult }: Props) => {
  const preview = flow.messages[judgeResult];
  return (
    <aside className="score-panel">
      <h2>{flow.label} スコア</h2>
      <div className="score-summary">
        <div>
          <span className="score-value">{result.stars}</span>
          <span className="score-label">合計★</span>
        </div>
        <div>
          <span className="score-value">{result.doubleStarCount}</span>
          <span className="score-label">★★ 件数</span>
        </div>
        <div>
          <span className="score-value">{result.tripleStarCount}</span>
          <span className="score-label">★★★ 件数</span>
        </div>
      </div>

      <div className="judge-preview">
        <p className="judge-title">{judgeLabels[judgeResult]}</p>
        <p className="judge-copy">{preview.split('\n')[0]}</p>
      </div>

      <div className="selection-list">
        <h3>現在の選択</h3>
        <ul>
          {selections.map(selection => (
            <li key={selection.questionId}>
              <span className="selection-question">{selection.questionTitle}</span>
              <span className="selection-answer">
                {selection.option ? (
                  <>
                    {selection.option.label}
                    {selection.option.tier ? `（${selection.option.tier}）` : ''}
                  </>
                ) : (
                  '未選択'
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default ScorePanel;
