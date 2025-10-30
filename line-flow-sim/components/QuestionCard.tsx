'use client';

import type { Option, Question } from '@/types/flow';

type Props = {
  question: Question;
  selected?: Option | null;
  onSelect: (option: Option) => void;
};

const tierLabel = (option: Option) => (option.tier ? option.tier : '－');

const QuestionCard = ({ question, selected, onSelect }: Props) => {
  return (
    <section className="card">
      <header className="card-header">
        <h2>{question.title}</h2>
      </header>
      <div className="card-body">
        <div className="options">
          {question.options.map(option => {
            const isSelected = selected?.label === option.label;
            return (
              <button
                key={option.label}
                type="button"
                className={`option-button ${isSelected ? 'option-button-active' : ''}`}
                onClick={() => onSelect(option)}
              >
                <span>{option.label}</span>
                <span className="option-tier">{tierLabel(option)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default QuestionCard;
