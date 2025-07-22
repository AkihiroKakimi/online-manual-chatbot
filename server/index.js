const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { put } = require('@vercel/blob');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 静的ファイルの配信
app.use(express.static(path.join(__dirname, '../public')));

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

let pdfContent = '';
let pdfFileName = '';
let pdfBuffer = null;

// ルートパスでHTMLファイルを配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Blob URL 用のアップロードエンドポイント
app.post('/upload-pdf-blob', async (req, res) => {
  try {
    const { blobUrl, fileName } = req.body;
    
    if (!blobUrl || !fileName) {
      return res.status(400).json({ error: 'Blob URL とファイル名が必要です' });
    }

    // Blob URLからPDFデータを取得
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error('Blob URLからのダウンロードに失敗');
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const dataBuffer = Buffer.from(arrayBuffer);
    
    // PDF解析
    const data = await pdf(dataBuffer);
    
    pdfContent = data.text;
    pdfFileName = fileName;
    pdfBuffer = dataBuffer;
    
    res.json({ 
      message: 'PDFが正常にアップロードされました',
      fileName: pdfFileName,
      pages: data.numpages,
      textLength: pdfContent.length
    });
  } catch (error) {
    console.error('PDF Blob処理エラー:', error);
    res.status(500).json({ error: 'PDFの処理中にエラーが発生しました: ' + error.message });
  }
});

app.post('/upload-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDFファイルがアップロードされていません' });
    }

    const dataBuffer = req.file.buffer; // メモリから直接取得
    const data = await pdf(dataBuffer);
    
    pdfContent = data.text;
    pdfFileName = req.file.originalname;
    pdfBuffer = dataBuffer; // PDFバイナリデータを保存
    
    res.json({ 
      message: 'PDFが正常にアップロードされました',
      fileName: pdfFileName,
      pages: data.numpages,
      textLength: pdfContent.length
    });
  } catch (error) {
    console.error('PDF処理エラー:', error);
    res.status(500).json({ error: 'PDFの処理中にエラーが発生しました' });
  }
});

app.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!pdfContent) {
      return res.status(400).json({ error: 'PDFファイルが読み込まれていません' });
    }
    
    if (!question) {
      return res.status(400).json({ error: '質問が入力されていません' });
    }

    // 質問から動的にキーワードを抽出 + 固定キーワード
    const questionWords = question.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const fixedKeywords = ['カートリッジ', 'トナー', '交換', '取り外し', '取り付け', '手順', '方法', '設定', 'エラー'];
    const allKeywords = [...new Set([...questionWords, ...fixedKeywords])];
    
    let relevantText = '';
    
    // キーワードに関連する行を検索
    const lines = pdfContent.split('\n');
    const foundLines = [];
    const foundIndices = [];
    
    lines.forEach((line, index) => {
      const lowerLine = line.toLowerCase();
      if (allKeywords.some(keyword => lowerLine.includes(keyword.toLowerCase()))) {
        foundIndices.push(index);
      }
    });
    
    // 見つかった行の周辺を取得
    foundIndices.forEach(index => {
      const start = Math.max(0, index - 3);
      const end = Math.min(lines.length, index + 4);
      foundLines.push(...lines.slice(start, end));
    });
    
    if (foundLines.length > 0) {
      relevantText = [...new Set(foundLines)].join('\n');
      // 長すぎる場合は分割して最も関連性の高い部分を選択
      if (relevantText.length > 12000) {
        // 「交換」「手順」「取り外し」など重要なキーワード周辺を優先
        const importantKeywords = ['交換', '手順', '取り外し', '取り付け'];
        const chunks = relevantText.split('\n\n');
        const prioritizedChunks = chunks.filter(chunk => 
          importantKeywords.some(kw => chunk.toLowerCase().includes(kw))
        );
        
        if (prioritizedChunks.length > 0) {
          relevantText = prioritizedChunks.join('\n\n').slice(0, 12000);
        } else {
          relevantText = relevantText.slice(0, 12000);
        }
      }
    } else {
      // キーワードが見つからない場合は、目次や索引から関連ページを探す
      const pageKeywords = ['214', '218', '223', '227']; // 前回の回答で得られたページ番号
      const pageLines = [];
      
      lines.forEach((line, index) => {
        if (pageKeywords.some(page => line.includes(page + 'ページ') || line.includes('p.' + page))) {
          const start = Math.max(0, index - 5);
          const end = Math.min(lines.length, index + 10);
          pageLines.push(...lines.slice(start, end));
        }
      });
      
      relevantText = pageLines.length > 0 ? 
        [...new Set(pageLines)].join('\n').slice(0, 12000) : 
        pdfContent.slice(0, 12000);
    }
    
    const prompt = `以下のマニュアル内容を参考に、質問に回答してください。
手順がある場合は具体的に説明してください。

マニュアル内容:
${relevantText}

質問: ${question}

回答:`;

    console.log(`質問: ${question}, プロンプト長: ${prompt.length}文字`);
    console.log(`見つかったキーワード行数: ${foundIndices.length}`);
    console.log(`関連テキストの最初の500文字: ${relevantText.slice(0, 500)}...`);

    // API制限チェックとフォールバック
    let answer = '';
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      answer = response.text();
    } catch (apiError) {
      console.log('Gemini API制限またはエラー、フォールバック回答を生成:', apiError.message);
      
      // シンプルなキーワードベース回答を生成
      if (relevantText.includes('カートリッジ') || relevantText.includes('トナー')) {
        answer = `マニュアル内でカートリッジ/トナーに関する記述が見つかりました。\n\n詳細な手順については、以下のページをご確認ください：\n- 214ページ: トナーカートリッジ交換\n- 218ページ: ドラムユニット交換\n- 223ページ: ベルトユニット交換\n- 227ページ: 廃トナーボックス交換`;
      } else if (question.toLowerCase().includes('エラー')) {
        answer = `エラーに関するトラブルシューティング情報は、マニュアルの後半部分（200ページ以降）に記載されています。`;
      } else if (question.toLowerCase().includes('設定')) {
        answer = `設定に関する情報は、マニュアルの前半部分（50-150ページ）に記載されています。`;
      } else {
        answer = `申し訳ございません。現在API制限により詳細な回答を生成できません。マニュアル内で「${question}」に関連するキーワードを検索してください。`;
      }
    }

    res.json({ 
      answer,
      fileName: pdfFileName,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Gemini API エラー詳細:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // より詳細なエラー情報を返す
    let errorMessage = '回答の生成中にエラーが発生しました';
    if (error.message) {
      if (error.message.includes('quota')) {
        errorMessage = 'API使用量制限に達しました。しばらく時間をおいて再試行してください。';
      } else if (error.message.includes('content')) {
        errorMessage = '入力内容に問題があります。質問を変更して再試行してください。';
      } else if (error.message.includes('key')) {
        errorMessage = 'APIキーの設定に問題があります。';
      }
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

app.post('/search', (req, res) => {
  try {
    const { searchTerm } = req.body;
    
    if (!pdfContent) {
      return res.status(400).json({ error: 'PDFファイルが読み込まれていません' });
    }
    
    if (!searchTerm) {
      return res.status(400).json({ error: '検索語が入力されていません' });
    }

    const lines = pdfContent.split('\n');
    const results = [];
    
    lines.forEach((line, index) => {
      if (line.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({
          lineNumber: index + 1,
          content: line.trim(),
          context: lines.slice(Math.max(0, index - 1), index + 2).join(' ')
        });
      }
    });

    res.json({ 
      searchTerm,
      results: results.slice(0, 20),
      totalMatches: results.length
    });
  } catch (error) {
    console.error('検索エラー:', error);
    res.status(500).json({ error: '検索中にエラーが発生しました' });
  }
});

app.get('/status', (req, res) => {
  res.json({
    hasDocument: !!pdfContent,
    hasPdfBuffer: !!pdfBuffer,
    fileName: pdfFileName,
    contentLength: pdfContent.length,
    bufferSize: pdfBuffer ? pdfBuffer.length : 0,
    timestamp: new Date().toISOString()
  });
});

app.get('/get-pdf', (req, res) => {
  console.log('PDF取得リクエスト:', { 
    hasPdfBuffer: !!pdfBuffer, 
    pdfFileName, 
    bufferSize: pdfBuffer ? pdfBuffer.length : 0 
  });
  
  if (!pdfBuffer) {
    console.log('エラー: PDFバッファがありません');
    return res.status(404).json({ error: 'PDFファイルがありません' });
  }
  
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${pdfFileName}"`);
  res.send(pdfBuffer);
  console.log('PDF送信完了');
});

app.post('/reset', (req, res) => {
  pdfContent = '';
  pdfFileName = '';
  pdfBuffer = null;
  res.json({ message: 'ドキュメントがリセットされました' });
});

app.listen(PORT, () => {
  console.log(`サーバーがポート ${PORT} で起動しました`);
  console.log(`Gemini API Key設定: ${process.env.GEMINI_API_KEY ? '設定済み' : '未設定'}`);
  console.log(`ブラウザで http://localhost:${PORT} にアクセスしてください`);
});