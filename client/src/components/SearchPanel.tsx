import React, { useState } from 'react';
import axios from 'axios';
import './SearchPanel.css';

interface SearchResult {
  lineNumber: number;
  content: string;
  context: string;
}

interface SearchResponse {
  searchTerm: string;
  results: SearchResult[];
  totalMatches: number;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SearchPanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [totalMatches, setTotalMatches] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const response = await axios.post<SearchResponse>(`${API_BASE_URL}/search`, {
        searchTerm: searchTerm.trim()
      });

      setResults(response.data.results);
      setTotalMatches(response.data.totalMatches);
    } catch (error) {
      console.error('検索エラー:', error);
      alert('検索中にエラーが発生しました。');
    } finally {
      setIsSearching(false);
    }
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="highlight">{part}</span>
      ) : part
    );
  };

  return (
    <div className="search-panel">
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="PDFマニュアル内を検索..."
            className="search-input"
            disabled={isSearching}
          />
          <button
            type="submit"
            disabled={!searchTerm.trim() || isSearching}
            className="search-button"
          >
            {isSearching ? '検索中...' : '検索'}
          </button>
        </div>
      </form>

      {results.length > 0 && (
        <div className="search-results">
          <div className="results-header">
            <p>
              「{searchTerm}」の検索結果: {totalMatches}件
              {totalMatches > results.length && ` (上位${results.length}件を表示)`}
            </p>
          </div>
          
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className="result-item">
                <div className="result-header">
                  <span className="line-number">行 {result.lineNumber}</span>
                </div>
                <div className="result-content">
                  {highlightSearchTerm(result.content, searchTerm)}
                </div>
                <div className="result-context">
                  <strong>文脈:</strong> {highlightSearchTerm(result.context, searchTerm)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {searchTerm && results.length === 0 && !isSearching && (
        <div className="no-results">
          「{searchTerm}」に該当する結果が見つかりませんでした。
        </div>
      )}
    </div>
  );
};

export default SearchPanel;