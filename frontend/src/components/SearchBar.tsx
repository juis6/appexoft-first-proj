import { useState, useRef, useEffect } from "react";
import { apiClient } from "../lib/api";
import type { SearchBarProps, SearchHistoryItem } from "../types";
import { Search } from "lucide-react";

export default function SearchBar({
  onSearch,
  isLoading = false,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (isDropdownOpen) {
      loadHistory();
    }
  }, [isDropdownOpen]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const response = await apiClient.getSearchHistory(20);
      setHistory(response.history);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setIsDropdownOpen(false);
    }
  };

  const handleHistoryClick = (query: string) => {
    setQuery(query);
    onSearch(query);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search for videos..."
            className="w-full px-6 py-4 text-lg text-gray-900 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-500 hover:text-blue-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <Search className="w-6 h-6" />
          </button>
        </div>
      </form>

      {isDropdownOpen && (
        <div className="absolute w-full mt-2 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 overflow-hidden z-50">
          <div className="flex flex-col">
            <div className="px-4 py-2 text-sm font-medium text-gray-500 border-b border-gray-200">
              Recent Searches
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {historyLoading ? (
                <div className="px-4 py-3 text-gray-500">
                  Loading history...
                </div>
              ) : history.length > 0 ? (
                history.map((item: SearchHistoryItem) => (
                  <button
                    key={item.timestamp}
                    onClick={() => handleHistoryClick(item.query)}
                    className="w-full px-4 py-3 text-left hover:bg-white/50 transition-colors duration-150 flex items-center justify-between group"
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-gray-400 group-hover:text-blue-500 transition-colors"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-gray-700 group-hover:text-blue-600 transition-colors">
                        {item.query}
                      </span>
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(item.timestamp).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500">
                  No recent searches
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="absolute right-16 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
