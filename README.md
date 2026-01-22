# 集中力向上・習慣化アプリ

ポモドーロタイマー、Todoリスト、ジャーナル、トロフィーゲットチャレンジ機能を備えた集中力向上・習慣化Webアプリケーションです。

## 技術スタック

- **フロントエンドフレームワーク**: React 19.2.3
- **ビルドツール**: Vite 7.3.1
- **開発ツール**: ESLint, Prettier
- **データストレージ**: LocalStorage / IndexedDB

## 開発環境セットアップ

### 必要な環境

- Node.js (v18以上推奨)
- npm または yarn

### セットアップ手順

1. **依存関係のインストール**

```bash
npm install
```

2. **開発サーバーの起動**

```bash
npm run dev
```

開発サーバーが起動すると、ブラウザで `http://localhost:3000` が自動的に開きます。

3. **ビルド**

本番環境用のビルドを作成する場合:

```bash
npm run build
```

ビルドされたファイルは `dist` ディレクトリに出力されます。

4. **プレビュー**

ビルドされたアプリケーションをプレビューする場合:

```bash
npm run preview
```

### 開発コマンド

- `npm run dev` - 開発サーバーを起動
- `npm run build` - 本番用ビルドを作成
- `npm run preview` - ビルド結果をプレビュー
- `npm run lint` - ESLintでコードをチェック
- `npm run format` - Prettierでコードをフォーマット

## プロジェクト構造

```
focus/
├── public/              # 静的ファイル
├── src/
│   ├── assets/         # 画像などのアセット
│   ├── components/      # 共通UIコンポーネント
│   ├── pages/           # 各画面コンポーネント
│   ├── services/        # データアクセス層
│   ├── models/          # データモデル定義
│   ├── utils/           # ユーティリティ関数
│   ├── styles/          # スタイルファイル
│   ├── App.jsx          # メインアプリケーションコンポーネント
│   ├── App.css          # アプリケーションスタイル
│   ├── main.jsx         # エントリーポイント
│   └── index.css        # グローバルスタイル
├── index.html           # HTMLテンプレート
├── vite.config.js       # Vite設定ファイル
├── package.json         # プロジェクト設定と依存関係
├── .eslintrc.cjs        # ESLint設定
├── .prettierrc          # Prettier設定
├── requirements.md      # 要件定義書
└── development.md       # 開発手順書
```

## 機能概要

### 実装済み機能

- ✅ プロジェクト環境構築
- ✅ 基本的なReactアプリケーション構造

### 今後実装予定の機能

- ポモドーロタイマー機能
- Todoリスト機能
- ジャーナル機能
- トロフィーゲットチャレンジ機能
- コレクション機能

詳細は `requirements.md` と `development.md` を参照してください。

## レスポンシブデザイン

本アプリケーションは以下の画面サイズに対応しています:

- **デスクトップ**: 1024px以上
- **タブレット**: 768px - 1023px
- **モバイル**: 480px - 767px
- **小型モバイル**: 480px以下

## ブラウザ対応

以下のモダンブラウザに対応しています:

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## ライセンス

ISC
