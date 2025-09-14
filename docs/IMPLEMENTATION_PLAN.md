# Chrome Extension 実装計画（MV3）

## 目標と前提
- 目的: `toby/` の UI/UX を再利用し、拡張機能（MV3）として動作する最初のリリースを作成。
- 最初のリリース範囲: `popup` + `side panel` + `options`、データ保存は `chrome.storage.local` のみ（同期なし）。
- 進め方: Next.js アプリ（`toby/`）は維持し、`chrome-ext/` を並行開発。

## ディレクトリ/成果物
```
chrome-ext/
  manifest.json
  src/
    background.ts            # Service Worker（永続処理・メッセージ仲介）
    content.ts               # 必要時に導入（当面は未使用でも可）
    popup/{index.html, main.tsx}
    sidepanel/{index.html, main.tsx}
    options/{index.html, main.tsx}
    styles/tailwind.css
  vite.config.ts
  tsconfig.json
  postcss.config.cjs
  tailwind.config.ts
```
- 共有: `../toby/components/ui/**` と `../toby/lib/utils.ts` を `vite` の `resolve.alias` と TS の `paths` で参照（`@toby/* -> ../toby/*`）。

## 主要依存関係（想定）
- `vite`, `@vitejs/plugin-react-swc`, `typescript`
- `tailwindcss`, `postcss`, `autoprefixer`
- 既存 UI: Radix + shadcn（`toby/components/ui`）を再利用

## Manifest（最小）
```json
{
  "manifest_version": 3,
  "name": "Toby Clone",
  "version": "0.1.0",
  "action": { "default_popup": "popup/index.html" },
  "side_panel": { "default_path": "sidepanel/index.html" },
  "options_page": "options/index.html",
  "background": { "service_worker": "background.js", "type": "module" },
  "permissions": ["storage", "tabs", "sidePanel"],
  "host_permissions": []
}
```

## Tailwind/ビルド設定
- `tailwind.config.ts`: `content` に `src/**/*` と `../toby/**/*` を追加。
- `vite.config.ts`: `resolve.alias` に `@/ -> src`, `@toby/ -> ../toby/`、`@/lib/utils` の参照に対応。
- 出力先は `chrome-ext/dist`。Chrome で「パッケージ化されていない拡張機能を読み込む」。

## ストレージ/メッセージング
- 保存: `chrome.storage.local` を薄いラッパで抽象化（`get<T>(key)`, `set(key, value)`, `remove(keys)`）。
- 通信: `runtime.sendMessage` / `onMessage` で `popup`/`sidepanel` ↔ `background`。必要に応じて `tabs` API を background 経由で使用。

## 実装タスク（チェックリスト）
- [ ] `chrome-ext` 雛形作成（Vite + React + TS + Tailwind）
- [ ] `manifest.json` 作成（popup/sidepanel/options/background、権限: storage/tabs/sidePanel）
- [ ] `vite.config.ts` と `tsconfig.json` にエイリアス設定（`@`, `@toby`）
- [ ] `tailwind.config.ts` と `postcss.config.cjs` 設定、`styles/tailwind.css` 追加
- [ ] `popup` 画面実装（最近保存/検索/追加 UI、既存 `Button`/`Input` 等を再利用）
- [ ] `side panel` 実装（一覧とフィルタ、ドラッグ&グループは次段階でも可）
- [ ] `options` 実装（データのエクスポート/インポート、設定）
- [ ] `background.ts` 実装（データ I/O、タブ取得、メッセージ仲介）
- [ ] ストレージラッパ/型定義（スキーマ versioning、将来の移行用 `migrate()`）
- [ ] 簡易 E2E 手順（手動）：ビルド→読み込み→基本操作確認

## コマンド（想定）
- 開発: `npm run dev`（watch ビルド）
- 本番: `npm run build` → `dist/`
- Lint: `npm run lint`

## 受け入れ基準（0.1.0）
- popup と side panel が表示・操作可能（追加/削除/一覧/簡易検索）。
- データは `chrome.storage.local` に保存・復元される。
- background ↔ UI のメッセージングが動作する。
- Next.js 側（`toby/`）はそのまま動作（並行開発）。

## 次段階（将来）
- `content script` 導入（ページ情報抽出）
- ブックマーク連携（`bookmarks` 権限）や `chrome.storage.sync` への移行
- 新しいタブページ置換、CI/CD（Zip 化・署名・デプロイ）
