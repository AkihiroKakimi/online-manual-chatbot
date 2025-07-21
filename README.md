# PDFマニュアル チャットボット

PDFマニュアルファイルを読み込んで、その内容について質問に回答するインテリジェントなチャットボットです。Google Gemini AIを活用して、自然な日本語での対話を実現します。

![チャットボットのスクリーンショット](https://via.placeholder.com/800x400/3498db/ffffff?text=PDF+Manual+Chatbot)

## 🚀 機能

### 基本機能
- ✅ **PDFアップロード**: ドラッグ&ドロップまたはクリックでPDFファイルをアップロード
- ✅ **AIチャット**: Google Gemini AIを使用した質問応答機能
- ✅ **日本語対応**: 完全な日本語インターフェースとAI応答
- ✅ **リアルタイム処理**: 即座にPDFを解析してチャット開始

### 高度な機能
- ✅ **検索機能**: PDF内容のキーワード検索とハイライト表示
- ✅ **評価システム**: 回答に対する「いいね」「だめ」評価
- ✅ **レスポンシブデザイン**: PC・タブレット・スマートフォン対応
- ✅ **ドキュメント管理**: 現在読み込み中のファイル情報表示

## 🛠️ 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **CSS3** (カスタムスタイル)
- **Axios** (HTTP通信)

### バックエンド
- **Node.js** + **Express**
- **PDF-Parse** (PDFテキスト抽出)
- **Multer** (ファイルアップロード)
- **Google Generative AI** (Gemini API)

### 開発ツール
- **Concurrently** (フロントエンド・バックエンド同時起動)
- **Nodemon** (バックエンド自動再起動)

## 📋 セットアップ手順

### 前提条件
- Node.js (v16.0.0以上)
- npm または yarn
- Google Gemini APIキー

### 1. プロジェクトのクローン
```bash
cd C:\\Users\\kakimi\\Documents\\project\\manual.chatbot
```

### 2. 依存関係のインストール
```bash
# ルートディレクトリで全ての依存関係をインストール
npm run install-all
```

または個別にインストール:
```bash
# ルート
npm install

# サーバー
cd server
npm install

# クライアント
cd ../client
npm install
```

### 3. 環境変数の設定
```bash
# server/.env ファイルを作成
cd server
cp .env.example .env
```

`.env` ファイルを編集:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
PORT=5000
```

### 4. Google Gemini APIキーの取得
1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API Key」をクリック
4. 生成されたAPIキーを `.env` ファイルに設定

### 5. アプリケーションの起動
```bash
# ルートディレクトリから（推奨）
npm run dev
```

または個別に起動:
```bash
# ターミナル1: サーバー起動
cd server
npm run dev

# ターミナル2: クライアント起動
cd client
npm start
```

### 6. ブラウザでアクセス
- フロントエンド: http://localhost:3000
- バックエンドAPI: http://localhost:5000

## 📖 使用方法

### 1. PDFファイルのアップロード
1. アプリケーションを開く
2. 「PDFマニュアルをアップロード」エリアにファイルをドラッグ&ドロップ
   - または、エリアをクリックしてファイル選択ダイアログを開く
3. PDFが処理されると、チャット画面に移行

### 2. 質問の送信
1. 画面下部のテキストエリアに質問を入力
2. 「送信」ボタンをクリック、またはEnterキー押下
3. AIが回答を生成して表示

### 3. 検索機能の使用
1. ヘッダーの「検索」ボタンをクリック
2. 検索パネルでキーワードを入力
3. 該当箇所がハイライト表示される

### 4. 回答の評価
- 各AI回答の右下にある👍（いいね）👎（だめ）ボタンをクリック

## 🔧 カスタマイズ

### APIベースURLの変更
`client/src/App.tsx` の `API_BASE_URL` を変更:
```typescript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
```

### フロントエンド環境変数
`client/.env` ファイルを作成:
```env
REACT_APP_API_URL=http://localhost:5000
```

### サーバーポートの変更
`server/.env` ファイル:
```env
PORT=8080
```

## 🚀 プロダクション環境での実行

### 1. フロントエンドのビルド
```bash
cd client
npm run build
```

### 2. サーバーの起動
```bash
cd server
npm start
```

### 3. 静的ファイルの配信（オプション）
サーバーでフロントエンドも配信する場合:
```javascript
// server/index.js に追加
app.use(express.static(path.join(__dirname, '../client/build')));
```

## 📁 プロジェクト構造

```
manual.chatbot/
├── README.md
├── package.json                    # ルートパッケージ設定
├── server/                         # バックエンド
│   ├── index.js                   # サーバーメインファイル
│   ├── package.json               # サーバー依存関係
│   ├── .env.example              # 環境変数テンプレート
│   └── .env                      # 環境変数（要作成）
├── client/                        # フロントエンド
│   ├── public/
│   │   └── index.html            # HTMLテンプレート
│   ├── src/
│   │   ├── components/           # Reactコンポーネント
│   │   │   ├── FileUpload.tsx    # ファイルアップロード
│   │   │   ├── FileUpload.css
│   │   │   ├── ChatInterface.tsx # チャットUI
│   │   │   ├── ChatInterface.css
│   │   │   ├── SearchPanel.tsx   # 検索機能
│   │   │   └── SearchPanel.css
│   │   ├── App.tsx               # メインアプリ
│   │   ├── App.css
│   │   ├── index.tsx             # エントリーポイント
│   │   ├── index.css
│   │   └── react-app-env.d.ts    # TypeScript定義
│   ├── package.json              # クライアント依存関係
│   └── tsconfig.json             # TypeScript設定
└── uploads/                       # アップロードファイル（一時）
```

## 🔍 トラブルシューティング

### よくある問題と解決方法

#### 1. Gemini APIエラー
**エラー**: "Gemini API エラー"
**解決方法**: 
- `.env` ファイルのAPIキーが正しく設定されているか確認
- APIキーのクォータ制限を確認
- ネットワーク接続を確認

#### 2. PDFアップロードエラー
**エラー**: "PDFの処理中にエラーが発生しました"
**解決方法**:
- PDFファイルが破損していないか確認
- ファイルサイズが大きすぎないか確認（推奨: 50MB以下）
- PDFにテキストデータが含まれているか確認

#### 3. ポート競合エラー
**エラー**: "Port 5000 is already in use"
**解決方法**:
```bash
# ポートを使用しているプロセスを終了
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

#### 4. NPMインストールエラー
**解決方法**:
```bash
# キャッシュクリア
npm cache clean --force

# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

### パフォーマンス最適化

#### 大きなPDFファイルの処理
- サーバーの `index.js` でテキスト長制限を調整:
```javascript
const prompt = `
// ...
PDFマニュアルの内容:
${pdfContent.slice(0, 50000)} // 50,000文字に制限
// ...
`;
```

#### フロントエンド最適化
- メッセージ履歴の制限:
```typescript
// App.tsx でメッセージ数を制限
const MAX_MESSAGES = 50;
setMessages(prev => [...prev.slice(-MAX_MESSAGES), botMessage]);
```

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチにプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを開く

## 📞 サポート

問題が発生した場合は、以下を確認してください:

1. **環境要件**: Node.js v16+、npm最新版
2. **ログ確認**: 
   - ブラウザの開発者ツールのConsoleタブ
   - サーバーのコンソール出力
3. **設定確認**: 
   - `.env` ファイルの存在とAPIキー
   - ポート番号の競合

---

**開発者向け情報**

このプロジェクトは教育目的で作成されており、初心者でも理解しやすいシンプルな構造を維持しています。プロダクション環境で使用する場合は、追加のセキュリティ対策やエラーハンドリングの実装を推奨します。

**最終更新**: 2024年1月