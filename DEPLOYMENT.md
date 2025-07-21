# PDFマニュアルチャットボット - デプロイガイド

## 🚀 Vercelでのデプロイ手順

### 1. GitHubリポジトリの準備

```bash
# プロジェクトをGitリポジトリとして初期化
git init
git add .
git commit -m "Initial commit: PDF Manual Chatbot"

# GitHubリポジトリを作成してプッシュ
git remote add origin https://github.com/yourusername/pdf-manual-chatbot.git
git branch -M main
git push -u origin main
```

### 2. Vercelアカウント設定

1. [Vercel](https://vercel.com)にアクセス
2. GitHubアカウントでサインアップ/ログイン
3. 「New Project」をクリック
4. GitHubリポジトリを選択

### 3. 環境変数の安全な設定

Vercelプロジェクトの設定で以下の環境変数を追加：

- `GEMINI_API_KEY`: あなたのGoogle Gemini APIキー
- `PORT`: `3000`

**重要**: APIキーは絶対にコードに直接書かないでください！

### 4. Google Gemini APIキーの取得

1. [Google AI Studio](https://makersuite.google.com/app/apikey)にアクセス
2. 新しいAPIキーを作成
3. VercelのEnvironment Variablesに設定

### 5. デプロイの実行

1. Vercelで「Deploy」をクリック
2. 自動的にビルドとデプロイが開始されます
3. デプロイ完了後、提供されるURLでアクセス可能

## 🔒 セキュリティベストプラクティス

### 環境変数の管理
- ✅ `.env`ファイルは`.gitignore`に追加済み
- ✅ APIキーはVercelの環境変数で管理
- ✅ 本番環境でのみ必要な値のみ設定

### APIキーの保護
```javascript
// ❌ 悪い例
const API_KEY = "AIzaSyCf5I5Y4UR9y9NCLyV8zXYfdzsosbXhSmY";

// ✅ 良い例
const API_KEY = process.env.GEMINI_API_KEY;
```

## 🛠️ トラブルシューティング

### よくある問題

1. **APIキーエラー**
   ```
   Error: GEMINI_API_KEY is not defined
   ```
   → Vercelの環境変数設定を確認

2. **CORS エラー**
   ```
   Access to fetch blocked by CORS policy
   ```
   → サーバー側でCORS設定を確認（設定済み）

3. **ファイルアップロードエラー**
   ```
   File upload failed
   ```
   → Vercelの50MBファイル制限を確認

### デバッグ方法

1. Vercelの「Functions」タブでログを確認
2. ブラウザのコンソールでエラーを確認
3. Network タブでAPI リクエストを確認

## 🔄 継続的デプロイ

GitHubリポジトリに変更をプッシュすると、Vercelが自動的に再デプロイします：

```bash
git add .
git commit -m "Update features"
git push origin main
# → Vercelが自動デプロイ
```

## 📋 必要な機能チェックリスト

- ✅ PDF アップロード機能
- ✅ Google Gemini AI 統合  
- ✅ ページジャンプ機能
- ✅ レスポンシブデザイン
- ✅ エラーハンドリング
- ✅ 環境変数によるセキュリティ
- ✅ 本番環境対応

## 📞 サポート

デプロイに関する問題がある場合は、以下を確認してください：

1. Vercelの環境変数設定
2. Google Gemini APIキーの有効性  
3. GitHubリポジトリの公開設定
4. Vercelのビルドログ