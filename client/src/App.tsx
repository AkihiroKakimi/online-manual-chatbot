import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';
import SearchPanel from './components/SearchPanel';
import './App.css';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  rating?: 'like' | 'dislike';
}

interface DocumentStatus {
  hasDocument: boolean;
  fileName: string;
  contentLength: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [documentStatus, setDocumentStatus] = useState<DocumentStatus>({
    hasDocument: false,
    fileName: '',
    contentLength: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    checkDocumentStatus();
  }, []);

  const checkDocumentStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status`);
      setDocumentStatus(response.data);
    } catch (error) {
      console.error('ステータス確認エラー:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/upload-pdf`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      await checkDocumentStatus();
      
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `${response.data.fileName} が正常にアップロードされました！\n（${response.data.pages}ページ、${response.data.textLength}文字）\n\nマニュアルの内容について質問してください。`,
        timestamp: new Date()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('アップロードエラー:', error);
      alert('ファイルのアップロードに失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/ask`, {
        question: content
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.data.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('質問送信エラー:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'エラーが発生しました。もう一度お試しください。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateMessage = (messageId: string, rating: 'like' | 'dislike') => {
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId ? { ...msg, rating } : msg
      )
    );
  };

  const handleReset = async () => {
    try {
      await axios.post(`${API_BASE_URL}/reset`);
      setMessages([]);
      setDocumentStatus({
        hasDocument: false,
        fileName: '',
        contentLength: 0
      });
    } catch (error) {
      console.error('リセットエラー:', error);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>PDFマニュアル チャットボット</h1>
        <div className="header-controls">
          {documentStatus.hasDocument && (
            <>
              <button
                className="search-button"
                onClick={() => setShowSearch(!showSearch)}
              >
                {showSearch ? '検索を閉じる' : '検索'}
              </button>
              <button className="reset-button" onClick={handleReset}>
                リセット
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-main">
        {!documentStatus.hasDocument ? (
          <div className="upload-section">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>
        ) : (
          <div className="chat-section">
            <div className="document-info">
              📄 {documentStatus.fileName} ({documentStatus.contentLength.toLocaleString()}文字)
            </div>
            
            {showSearch && (
              <SearchPanel />
            )}
            
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              onRateMessage={handleRateMessage}
              isLoading={isLoading}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;