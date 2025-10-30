'use client';

type Props = {
  message: string;
  ctaHref?: string;
};

const ResultMessage = ({ message, ctaHref = '#' }: Props) => {
  const [beforeLink, afterLink] = message.split('[予約フォームリンク]');

  return (
    <section className="result-message">
      <h2>結果メッセージ</h2>
      <div className="result-body">
        <p className="result-text">{beforeLink ?? ''}</p>
        <a href={ctaHref} className="cta-link" target="_blank" rel="noreferrer">
          予約フォーム（ダミー）
        </a>
        {afterLink ? <p className="result-text">{afterLink}</p> : null}
      </div>
    </section>
  );
};

export default ResultMessage;
