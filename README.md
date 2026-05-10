# Sudoku App — 開発ノート

## プロジェクト概要

React + TypeScript で実装した、フル機能の数独（Sudoku）ゲームアプリです。
Vite でビルドし、Cloudflare Pages にデプロイ可能な構成になっています。

---

## 技術スタック

| カテゴリ       | 使用技術                        |
|--------------|-------------------------------|
| フレームワーク  | React 18                      |
| 言語          | TypeScript（strict モード）      |
| ビルドツール   | Vite 5                         |
| スタイリング   | CSS Modules                    |
| デプロイ       | Cloudflare Pages               |
| パッケージ管理  | npm                            |

外部ゲームライブラリは一切使用せず、数独ロジックをゼロから実装しています。

---

## ディレクトリ構成

```
sudoku-app/
├── public/
│   └── favicon.svg             # アプリアイコン
├── src/
│   ├── components/
│   │   ├── Board/
│   │   │   ├── Board.tsx       # 9×9 グリッド全体のレンダリング
│   │   │   └── Board.module.css
│   │   ├── Cell/
│   │   │   ├── Cell.tsx        # 個別セルコンポーネント
│   │   │   └── Cell.module.css
│   │   ├── Controls/
│   │   │   ├── Controls.tsx    # 難易度・タイマー・◀▶・新しいゲーム
│   │   │   └── Controls.module.css
│   │   └── NumberPad/
│   │       ├── NumberPad.tsx   # 数字入力パッド（1〜9 + 消去）
│   │       └── NumberPad.module.css
│   ├── hooks/
│   │   └── useSudoku.ts        # ゲーム全体のステート管理フック
│   ├── utils/
│   │   ├── generator.ts        # パズル生成（バックトラッキング・一意解保証）
│   │   └── validator.ts        # 配置検証・完成判定
│   ├── types/
│   │   └── index.ts            # 共通型定義
│   ├── App.tsx                 # ルートコンポーネント・キーボード処理
│   ├── App.module.css          # CSS カスタムプロパティ（デザイントークン）
│   └── main.tsx                # エントリポイント
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── wrangler.toml               # Cloudflare Pages 設定
```

---

## ローカル開発

### 1. 依存パッケージをインストール

```bash
cd sudoku-app
npm install
```

### 2. 開発サーバーを起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開くと動作確認できます。
ホットリロード対応なので、ファイルを保存するたびに即時反映されます。

### 3. 本番ビルド

```bash
npm run build
```

`dist/` ディレクトリに最適化されたファイルが出力されます。

### 4. ビルド結果のプレビュー

```bash
npm run preview
```

---

## Cloudflare Pages へのデプロイ

### 前提条件

Wrangler CLI が `devDependencies` に含まれているため、追加インストール不要です。

### 手順

#### 初回のみ：Cloudflare アカウントにログイン

```bash
npx wrangler login
```

ブラウザが開くので、Cloudflare アカウントで認証してください。

#### デプロイ実行

```bash
npm run deploy
```

このコマンドは以下を順番に実行します：
1. `npm run build` → TypeScript コンパイル＋ Vite ビルド
2. `wrangler pages deploy` → `dist/` を Cloudflare Pages にアップロード

初回デプロイ時はプロジェクト名（`sudoku-app`）で新規プロジェクトが作成されます。
2 回目以降は同じプロジェクトに上書きデプロイされます。

#### `wrangler.toml` の設定内容

```toml
name = "sudoku-app"
pages_build_output_dir = "./dist"
compatibility_date = "2024-01-01"
```

---

## ゲーム機能

### 基本操作

| 操作             | 方法                                        |
|----------------|-------------------------------------------|
| セル選択          | クリック                                    |
| 数字入力          | セル選択後に数字パッドをクリック               |
| 数字削除          | セル選択後に「✕」ボタンをクリック             |
| キーボード入力     | 数字キー（1〜9）、Backspace / Delete         |
| カーソル移動       | 矢印キー（←↑→↓）                            |
| 1手戻す（Revert） | ◀ ボタン、または Ctrl+Z / Cmd+Z             |
| 1手進む（Forward）| ▶ ボタン、または Ctrl+Y / Ctrl+Shift+Z      |

### ハイライト機能

選択中のセルに応じて以下がハイライトされます：

- **同じ行・列・3×3 ボックス**：薄い青でハイライト
- **同じ数字**：やや濃いハイライト
- **選択セル自体**：最も濃いハイライト

### エラー表示

同じ行・列・ボックスに同じ数字が存在する場合、該当セルが赤背景で表示されます。

### Revert / Forward（◀▶）

推測で数字を入れて行き詰まったとき、手順を遡って別の選択肢を試せます。

- **◀（Revert）**：直前の入力を1手取り消す。取り消した手は Forward で再実行可能
- **▶（Forward）**：取り消した手を1手やり直す
- 新たに数字を入力すると Forward 履歴はクリアされる（枝分かれ）
- 最大 50 手分の履歴を保持

### マークカラー（推測アノテーション）

直前に入力したセル（点線枠＋右下の小ドットで示される）は、再クリックするたびにフォント色が巡回します。
推測で入れた数字に目印を付けることで、バックトラック後も「どこまで試したか」を把握できます。

| クリック回数 | 色                        |
|------------|--------------------------|
| 0（初期）   | 黒（#111827）              |
| 1          | 赤（#dc2626）              |
| 2          | 緑（#16a34a）              |
| 3          | 紫（#9333ea）              |
| 4          | 橙（#d97706）              |
| 5          | 黒に戻る                   |

マークの対象は**直近の1セルのみ**です。別のセルへ移動・別の数字を入力すると前のセルの色は固定されます。

#### Revert 時のフラッシュ演出

マークされたセル（色付きセル）が Revert で消える際、2回点滅してから盤面が巻き戻ります。
アニメーション中に ◀ を再クリックすると即座に巻き戻ります。

### 難易度

| 難易度  | 空きマス数（目標） | 一意解保証 |
|--------|---------------|---------|
| Easy   | 35 マス        | あり     |
| Medium | 45 マス        | あり     |
| Hard   | 55 マス        | あり     |

全難易度で解が1つだけになるようチェックしています。一意性を保てないセルは削除をスキップするため、Hard では目標より空きマスが少なくなる場合があります。

### タイマー

- ゲーム開始と同時にカウントアップ
- パズル完成時に自動停止（Revert / Forward 経由の完成も正しく検出）
- 新しいゲーム開始でリセット

---

## 数独アルゴリズムの実装メモ

### パズル生成（`generator.ts`）

1. **完全解の生成**：9×9 のゼロ埋め盤から出発し、バックトラッキングで有効な完全解を生成します。
   各セルに配置する数字は Fisher-Yates シャッフルして探索するため、毎回異なるパズルが生成されます。

2. **セルの削除**：完全解からランダムにセルを取り除きます。
   削除のたびに `countSolutions(puzzle, 2)` を呼び、解が1つだけの場合のみ削除を確定します。
   解が複数になる場合はそのセルの削除をスキップし、次の候補に移ります。

### 検証ロジック（`validator.ts`）

- `isValidPlacement`：指定した行・列・ボックスに同じ数字がないかを確認
- `isBoardComplete`：全セルが埋まり、かつ解と完全一致するかを確認

### 状態管理（`useSudoku.ts`）

- React の `useReducer` でゲームの全状態を管理
- アクション型は `SELECT_CELL | INPUT_NUMBER | CLEAR_CELL | REVERT | FORWARD | CYCLE_MARK_COLOR | NEW_GAME | SET_DIFFICULTY | TICK`
- `history`（最大50手）と `future` スタックで Revert / Forward を実現
- 数字を入力するたびに全セルのエラー状態を再計算（O(81) なので十分高速）
- `REVERT` / `FORWARD` 後も `isBoardComplete` を実行して完成状態を正しく検出
- タイマーは `setInterval` で 1 秒ごとに `TICK` をディスパッチ

### テーマ対応

`App.module.css` に CSS カスタムプロパティとして全カラーを定義しています。
`@media (prefers-color-scheme: dark)` でダークモードに自動切り替えします。
