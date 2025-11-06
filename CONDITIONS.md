# 条件分岐仕様書

## 目次
1. [フロー選択の条件分岐](#フロー選択の条件分岐)
2. [スコア計算ロジック](#スコア計算ロジック)
3. [判定ロジック](#判定ロジック)
4. [チャットフローの条件分岐](#チャットフローの条件分岐)
5. [UI表示の条件分岐](#ui表示の条件分岐)

---

## フロー選択の条件分岐

### カテゴリ選択処理 (`ChatFlow.tsx` - `handleCategory`)

```typescript
handleCategory(key: 'divorce' | 'inheritance' | 'labor')
```

**条件分岐:**
- **IF** `key === flow.key` (選択したカテゴリが現在のフローと同じ場合)
  - `categoryLabel` に `flow.label` を設定
  - `categoryConfirmed` を `true` に設定
  - 現在のページでカテゴリ確認状態を有効化
- **ELSE** (選択したカテゴリが現在のフローと異なる場合)
  - `router.push(\`/demo/${key}\`)` で該当するフローページに遷移

---

## スコア計算ロジック

### calc関数 (`lib/score.ts`)

**入力:** `choices: Option[]` (選択されたオプションの配列)

**計算式:**
1. **合計スコア (stars)**
   ```
   stars = Σ(choice.score) for all choices
   ```

2. **★の数 (singleStarCount)**
   ```
   singleStarCount = count(choices where tier === '★')
   ```

3. **★★の数 (doubleStarCount)**
   ```
   doubleStarCount = count(choices where tier === '★★')
   ```

4. **★★★の数 (tripleStarCount)**
   ```
   tripleStarCount = count(choices where tier === '★★★')
   ```

**出力:** `Result` オブジェクト
```typescript
{
  stars: number,
  singleStarCount: number,
  doubleStarCount: number,
  tripleStarCount: number
}
```

---

## 判定ロジック

### judge関数 (`lib/score.ts`)

**入力:** `result: Result` (スコア計算結果)

**条件分岐（優先順位順）:**

1. **IF** `result.tripleStarCount >= 3`
   - **判定:** `'high'`
   - **ラベル:** `'優先対応（高）'`
   - **メッセージ:** `flow.messages.high`

2. **ELSE IF** `result.doubleStarCount >= 2`
   - **判定:** `'medium'`
   - **ラベル:** `'優先対応（中）'`
   - **メッセージ:** `flow.messages.medium`

3. **ELSE IF** `result.stars === 0`
   - **判定:** `'reject'`
   - **ラベル:** `'案内不可'`
   - **メッセージ:** `flow.messages.reject`

4. **ELSE IF** `result.singleStarCount <= 1`
   - **判定:** `'low'`
   - **ラベル:** `'優先対応（低）'`
   - **メッセージ:** `flow.messages.low`

5. **ELSE** (その他すべての場合)
   - **判定:** `'low'`
   - **ラベル:** `'優先対応（低）'`
   - **メッセージ:** `flow.messages.low`

---

## チャットフローの条件分岐

### メッセージ表示ロジック (`ChatFlow.tsx` - `messages`)

#### 基本メッセージ
常に最初に表示:
- `{ role: 'bot', text: 'ご登録ありがとうございます！どちらの内容でご相談がありますか？' }`

#### カテゴリ確認前 (`categoryConfirmed === false`)
- 基本メッセージのみ表示
- クイックリプライでカテゴリ選択ボタンを表示

#### カテゴリ確認後 (`categoryConfirmed === true`)

1. **カテゴリ選択のユーザーメッセージ**
   - `categoryLabel` が存在する場合、ユーザーメッセージとして追加

2. **イントロメッセージ**
   - `{ role: 'bot', text: flow.intro }` を追加

3. **質問と回答の表示**
   ```
   FOR each question in flow.questions:
     - 質問をボットメッセージとして追加
     - IF 回答済み (value[q.id] が存在):
       - 回答をユーザーメッセージとして追加
       - 次の質問へ
     - ELSE:
       - ループを終了（未回答の質問で停止）
   ```

4. **全質問回答済み時 (`allAnswered === true`)**
   - **サマリーメッセージ**を追加:
     ```
     ご回答ありがとうございました！
     合計スコア：{result.stars}
     ★：{result.singleStarCount}
     ★★：{result.doubleStarCount}
     ★★★：{result.tripleStarCount}
     判定：{judgeLabels[judgeResult]}
     ```
   - **最終メッセージ**を追加:
     - `flow.messages[judgeResult]` の内容を表示

### クイックリプライ表示条件 (`ChatFlow.tsx`)

**条件分岐:**
- **IF** `!allAnswered` (全質問未回答)
  - クイックリプライを表示
  - **IF** `!categoryConfirmed` (カテゴリ未確認)
    - カテゴリ選択ボタンを表示:
      - 「不倫・離婚」→ `handleCategory('divorce')`
      - 「相続・遺産」→ `handleCategory('inheritance')`
      - 「労働トラブル」→ `handleCategory('labor')`
  - **ELSE** (カテゴリ確認済み)
    - 現在の質問の選択肢を表示
    - 各選択肢に `+{opt.score}` を表示
    - `currentAnswered === true` の場合、ボタンを無効化
- **ELSE** (全質問回答済み)
  - クイックリプライを非表示

### 質問表示制御 (`ChatFlow.tsx`)

**計算ロジック:**
- `firstUnansweredIndex` = 最初の未回答質問のインデックス（見つからない場合は -1）
- `visibleIndex` = `firstUnansweredIndex === -1` の場合、最後の質問のインデックス、そうでなければ `firstUnansweredIndex`
- `currentQuestion` = `flow.questions[visibleIndex]`
- `currentAnswered` = `!!value[currentQuestion.id]`

---

## UI表示の条件分岐

### ページレイアウト (`app/demo/[key]/page.tsx`)

- すべてのフローで `<main className="container demo-page">` を使用。
- `.demo-layout` 内にチャット領域と `ScorePanel` を並べて表示する。
- ScorePanel は常にレンダリングされ、チャット結果と同期して更新される。

### CSS レスポンシブ条件分岐 (`globals.css`)

- モバイル幅 (960px 未満) では `.demo-layout` を縦並び (`flex-direction: column`) にしてチャットとスコアを上下に配置。
- 960px 以上では `.demo-layout` を 2 カラムグリッドにして、左にチャット (最大幅 420px)、右に ScorePanel (最大幅 320px) を固定表示。
- **ELSE** (デスクトップ)
  - `.demo-layout` を `grid` レイアウトに設定
  - `.demo-layout-no-sidebar` の場合、`grid-template-columns: minmax(0, 420px)`
  - 通常の場合、`grid-template-columns: minmax(0, 420px) minmax(0, 320px)`
  - `.score-panel` を `position: sticky` に設定

---

## フロー別の質問とスコア体系

### 1. 離婚・男女問題 (divorce)

#### 質問1: 配偶者の年収は？
- `500万円未満` → score: 0, tier: null
- `500〜1000万円` → score: 1, tier: ★
- `1000〜2000万円` → score: 2, tier: ★★
- `2000万円以上` → score: 3, tier: ★★★

#### 質問2: 婚姻期間は？
- `5年未満` → score: 0, tier: null
- `5〜10年` → score: 1, tier: ★
- `10〜20年` → score: 2, tier: ★★
- `20年以上` → score: 3, tier: ★★★

#### 質問3: お子様はいますか？
- `いない` → score: 0, tier: null
- `1人` → score: 1, tier: ★
- `2人` → score: 2, tier: ★★
- `3人以上` → score: 3, tier: ★★★

#### 質問4: 不倫の証拠はありますか？
- `証拠はない` → score: 0, tier: null
- `不確かだがある` → score: 1, tier: ★
- `複数の証拠が揃っている` → score: 2, tier: ★★
- `決定的な証拠が揃っている（写真・動画・記録）` → score: 3, tier: ★★★

#### 質問5: 不倫相手の情報は？
- `わからない` → score: 0, tier: null
- `職場はわかる` → score: 1, tier: ★
- `名前・住所がわかる` → score: 2, tier: ★★
- `名前・住所・勤務先など詳細がわかる` → score: 3, tier: ★★★

---

### 2. 相続・遺産分割 (inheritance)

#### 質問1: 遺産総額の目安は？
- `3000万円未満` → score: 0, tier: null
- `3000〜5000万円` → score: 1, tier: ★
- `5000〜1億円` → score: 2, tier: ★★
- `1億円以上` → score: 3, tier: ★★★

#### 質問2: 相続人の人数は？
- `1〜2人` → score: 0, tier: null
- `3〜4人` → score: 1, tier: ★
- `5〜6人` → score: 2, tier: ★★
- `7人以上` → score: 3, tier: ★★★

#### 質問3: 相続人間で争いは？
- `特にない` → score: 0, tier: null
- `意見が分かれている` → score: 1, tier: ★
- `調停・訴訟を検討中` → score: 2, tier: ★★
- `既に調停・訴訟中` → score: 3, tier: ★★★

#### 質問4: 遺言書はありますか？
- `ない / 不明` → score: 0, tier: null
- `自筆である` → score: 1, tier: ★
- `自筆だが内容に不備がある` → score: 2, tier: ★★
- `公正証書など専門家が関与` → score: 3, tier: ★★★

#### 質問5: 相続税の申告期限まで？
- `12ヶ月以上ある` → score: 0, tier: null
- `6〜12ヶ月` → score: 1, tier: ★
- `3〜6ヶ月` → score: 2, tier: ★★
- `3ヶ月未満` → score: 3, tier: ★★★

---

### 3. 労働トラブル (labor)

#### 質問1: お悩みの内容は？
- `職場環境の不安・相談したい` → score: 0, tier: null
- `未払い残業代` → score: 1, tier: ★
- `パワハラ・セクハラ` → score: 2, tier: ★★
- `不当解雇・退職強要` → score: 3, tier: ★★★

#### 質問2: 問題の期間は？
- `1ヶ月未満` → score: 0, tier: null
- `1〜3ヶ月` → score: 1, tier: ★
- `3〜6ヶ月` → score: 2, tier: ★★
- `6ヶ月以上` → score: 3, tier: ★★★

#### 質問3: 証拠は揃っていますか？
- `これから集める` → score: 0, tier: null
- `メモ・日記など簡易な記録がある` → score: 1, tier: ★
- `メール・LINEがある` → score: 2, tier: ★★
- `タイムカード・録音など確実な証拠がある` → score: 3, tier: ★★★

#### 質問4: 現在のご状況は？
- `就労中` → score: 0, tier: null
- `休職中` → score: 1, tier: ★
- `退職予定` → score: 2, tier: ★★
- `退職済` → score: 3, tier: ★★★

#### 質問5: 健康面・生活への影響は？
- `特になし` → score: 0, tier: null
- `睡眠不足など軽度の不調` → score: 1, tier: ★
- `通院中` → score: 2, tier: ★★
- `休職・退職が必要` → score: 3, tier: ★★★

---

## 判定結果とメッセージ

### 判定結果の種類

1. **high** (優先対応（高）)
   - 条件: `tripleStarCount >= 3`
   - メッセージ: `flow.messages.high`

2. **medium** (優先対応（中）)
   - 条件: `doubleStarCount >= 2` かつ `tripleStarCount < 3`
   - メッセージ: `flow.messages.medium`

3. **low** (優先対応（低）)
   - 条件: `stars > 0` かつ `singleStarCount <= 1` またはその他
   - メッセージ: `flow.messages.low`

4. **reject** (案内不可)
   - 条件: `stars === 0`
   - メッセージ: `flow.messages.reject`

---

## 処理フロー図

```
開始
 ↓
[カテゴリ選択画面]
 ↓
IF カテゴリ選択
  IF 同じフロー → カテゴリ確認
  ELSE → 該当フローページへ遷移
 ↓
[質問1表示]
 ↓
ユーザーが選択
 ↓
[質問2表示]
 ↓
... (質問3, 4, 5)
 ↓
[全質問回答済み]
 ↓
[スコア計算]
  - stars合計
  - ★, ★★, ★★★ の数
 ↓
[判定]
  IF tripleStarCount >= 3 → high
  ELSE IF doubleStarCount >= 2 → medium
  ELSE IF stars === 0 → reject
  ELSE → low
 ↓
[結果メッセージ表示]
  - サマリー
  - 最終メッセージ (flow.messages[judgeResult])
 ↓
終了
```

---

## 特殊な条件分岐

### 労働トラブルページの特別処理

**条件:** `flow.key === 'labor'`

- ScorePanelを非表示
- レイアウトを1カラムに変更 (`demo-layout-no-sidebar`)
- 右側のスペースを削除

### レスポンシブ対応

**デスクトップ (>= 960px):**
- グリッドレイアウト: 左420px + 右320px
- ScorePanelはsticky配置

**モバイル (< 960px):**
- フレックスレイアウト（縦並び）
- ScorePanelはstatic配置

---

## データ構造

### Option型
```typescript
{
  label: string;      // 選択肢の表示テキスト
  score: number;      // スコア値 (0-3)
  tier: '★' | '★★' | '★★★' | null;  // ティア
}
```

### Result型
```typescript
{
  stars: number;           // 合計スコア
  singleStarCount: number;  // ★の数
  doubleStarCount: number;  // ★★の数
  tripleStarCount: number; // ★★★の数
}
```

### JudgeResult型
```typescript
'high' | 'medium' | 'low' | 'reject'
```

---

## 注意事項

1. **判定の優先順位**: judge関数は上から順に評価されるため、`tripleStarCount >= 3` の条件が最優先
2. **全質問回答済み判定**: `allAnswered` は `selectedOptions.length === flow.questions.length && flow.questions.length > 0` で判定
3. **未回答質問の制御**: 最初の未回答質問でメッセージ表示とクイックリプライを停止
4. **カテゴリ確認状態**: `categoryConfirmed` が `false` の間は、質問メッセージは表示されない
