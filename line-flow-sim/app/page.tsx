import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <header className="hero">
        <h1>公式LINE 質問分岐シミュレーション</h1>
        <p>「公式ライン登録」を想定した最初のご案内です。該当の相談内容をお選びください。</p>
      </header>

      <section className="chat-wrap">
        <div className="chat-stream">
          <div className="bubble bubble-bot">
            <p>ご登録ありがとうございます！どちらの内容でご相談がありますか？</p>
          </div>
        </div>

        <div className="quick-replies">
          <Link href="/demo/divorce" className="qr">不倫・離婚</Link>
          <Link href="/demo/inheritance" className="qr">相続・遺産</Link>
          <Link href="/demo/labor" className="qr">労働トラブル</Link>
        </div>
      </section>
    </main>
  );
}
