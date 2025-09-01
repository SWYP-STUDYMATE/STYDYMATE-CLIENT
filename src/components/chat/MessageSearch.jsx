import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { searchChatMessages } from '../../api/chat';

const MessageSearch = ({ roomId, isOpen, onClose, messages, onHighlightMessage }) => {
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // 검색창이 열릴 때 포커스
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 키워드 변경 시 검색 실행 (디바운싱)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (keyword.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch();
      }, 300);
    } else {
      setSearchResults([]);
      setCurrentIndex(-1);
      setTotalResults(0);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [keyword, roomId]);

  const performSearch = async () => {
    if (!keyword.trim() || !roomId) return;

    setIsLoading(true);
    try {
      // 서버 검색
      const serverResults = await searchChatMessages(roomId, keyword.trim());
      
      // 로컬 메시지에서도 검색 (실시간 메시지)
      const localResults = messages.filter(msg => 
        msg.message && msg.message.toLowerCase().includes(keyword.toLowerCase())
      );

      // 결과 합치기 (중복 제거)
      const allResults = [...serverResults.content];
      localResults.forEach(local => {
        if (!allResults.find(server => server.messageId === local.messageId)) {
          allResults.push(local);
        }
      });

      // 시간순 정렬 (최신순)
      allResults.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

      setSearchResults(allResults);
      setTotalResults(allResults.length);
      setCurrentIndex(allResults.length > 0 ? 0 : -1);

      // 첫 번째 결과로 이동
      if (allResults.length > 0) {
        onHighlightMessage(allResults[0]);
      }
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateResult = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === 'up') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : searchResults.length - 1;
    } else {
      newIndex = currentIndex < searchResults.length - 1 ? currentIndex + 1 : 0;
    }

    setCurrentIndex(newIndex);
    onHighlightMessage(searchResults[newIndex]);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        navigateResult('up');
      } else {
        navigateResult('down');
      }
    }
  };

  const formatTimestamp = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-white border-b border-gray-200 shadow-lg">
      <div className="p-4">
        {/* 검색 입력창 */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="메시지 검색..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C471] focus:border-transparent"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#00C471] rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* 네비게이션 버튼들 */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-gray-500 px-2">
              {totalResults > 0 ? `${currentIndex + 1}/${totalResults}` : '0'}
            </span>
            <button
              onClick={() => navigateResult('up')}
              disabled={searchResults.length === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateResult('down')}
              disabled={searchResults.length === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 검색 결과 미리보기 */}
        {keyword.length >= 2 && searchResults.length > 0 && (
          <div className="max-h-32 overflow-y-auto bg-gray-50 rounded-lg">
            {searchResults.slice(0, 5).map((result, index) => (
              <button
                key={result.messageId}
                onClick={() => {
                  setCurrentIndex(index);
                  onHighlightMessage(result);
                }}
                className={`w-full text-left p-2 hover:bg-gray-100 border-b border-gray-200 last:border-b-0 ${
                  index === currentIndex ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {result.sender.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTimestamp(result.sentAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  {highlightKeyword(result.message, keyword)}
                </p>
              </button>
            ))}
            {searchResults.length > 5 && (
              <div className="p-2 text-center text-xs text-gray-500">
                +{searchResults.length - 5}개 더
              </div>
            )}
          </div>
        )}

        {/* 검색 도움말 */}
        {keyword.length === 0 && (
          <div className="text-sm text-gray-500">
            <p>메시지를 검색하세요. (최소 2글자)</p>
            <p className="text-xs mt-1">Enter: 다음 결과, Shift+Enter: 이전 결과, Esc: 닫기</p>
          </div>
        )}

        {keyword.length >= 2 && searchResults.length === 0 && !isLoading && (
          <div className="text-sm text-gray-500 text-center py-4">
            검색 결과가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageSearch;