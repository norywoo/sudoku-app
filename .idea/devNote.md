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
├── .idea/
│   └── devNote.md              # 本ファイル（開発ドキュメント）
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
│   │   │   ├── Controls.tsx    # 難易度・タイマー・新しいゲーム
│   │   │   └── Controls.module.css
│   │   └── NumberPad/
│   │       ├── NumberPad.tsx   # 数字入力パッド（1〜9 + 消去）
│   │       └── NumberPad.module.css
│   ├── hooks/
│   │   └── useSudoku.ts        # ゲーム全体のステート管理フック
│   ├── utils/
│   │   ├── generator.ts        # パズル生成（バックトラッキング）
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
2. `wrangler pages deploy dist` → `dist/` を Cloudflare Pages にアップロード

初回デプロイ時はプロジェクト名（`sudoku-app`）で新規プロジェクトが作成されます。
2 回目以降は同じプロジェクトに上書きデプロイされます。

#### `wrangler.toml` の設定内容

```toml
name = "sudoku-app"          # Cloudflare Pages プロジェクト名
compatibility_date = "2024-01-01"

[site]
bucket = "./dist"            # デプロイ対象ディレクトリ
```

---

## ゲーム機能

### 基本操作

| 操作             | 方法                              |
|----------------|----------------------------------|
| セル選択          | クリック                           |
| 数字入力          | セル選択後に数字パッドをクリック      |
| 数字削除          | セル選択後に「✕」ボタンをクリック    |
| キーボード入力     | 数字キー（1〜9）、Backspace / Delete |
| カーソル移動       | 矢印キー（←↑→↓）                  |

### ハイライト機能

選択中のセルに応じて以下がハイライトされます：

- **同じ行・列・3×3 ボックス**：薄い青でハイライト
- **同じ数字**：やや濃いハイライト
- **選択セル自体**：最も濃いハイライト

### エラー表示

同じ行・列・ボックスに同じ数字が存在する場合、該当セルが赤背景で表示されます。

### 難易度

| 難易度  | 削除マス数 |
|--------|---------|
| Easy   | 35 マス  |
| Medium | 45 マス  |
| Hard   | 55 マス  |

### タイマー

- ゲーム開始と同時にカウントアップ
- パズル完成時に自動停止
- 新しいゲーム開始でリセット

---

## 数独アルゴリズムの実装メモ

### パズル生成（`generator.ts`）

1. **完全解の生成**：9×9 のゼロ埋め盤から出発し、バックトラッキングで有効な完全解を生成します。
   - 各セルに配置する数字はランダムシャッフルして探索することで、毎回異なるパズルが生成されます。

2. **セルの削除**：生成した完全解からランダムにセルを取り除きます。
   - Easy / Medium：削除後に解が一意かどうか確認（解が複数ある場合は削除をスキップ）
   - Hard：一意性チェックを省略して高速化（まれに複数解が存在する可能性あり）

### 検証ロジック（`validator.ts`）

- `isValidPlacement`：指定した行・列・ボックスに同じ数字がないかを確認
- `isBoardComplete`：全セルが埋まり、かつ解と完全一致するかを確認

### 状態管理（`useSudoku.ts`）

- React の `useReducer` でゲームの全状態を管理
- アクション型は `SELECT_CELL | INPUT_NUMBER | CLEAR_CELL | NEW_GAME | SET_DIFFICULTY | TICK`
- 数字を入力するたびに全セルのエラー状態を再計算（O(81) なので十分高速）
- タイマーは `setInterval` で 1 秒ごとに `TICK` をディスパッチ

### テーマ対応

`App.module.css` に CSS カスタムプロパティとして全カラーを定義しています。
`@media (prefers-color-scheme: dark)` でダークモードに自動切り替えします。
