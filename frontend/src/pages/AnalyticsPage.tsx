import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../lib/api";
import type { SearchAnalyticsItem } from "../types";

export default function AnalyticsPage() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<SearchAnalyticsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getAnalytics(20);
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (query: string) => {
    navigate("/", { state: { searchQuery: query } });
  };

  const maxCount =
    analytics.length > 0 ? Math.max(...analytics.map((a) => a.count)) : 1;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center py-20">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white border-t-transparent mx-auto"></div>
            <p className="mt-8 text-2xl text-white font-semibold">
              Loading analytics...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="mb-8 px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-full font-semibold shadow-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Home
          </button>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Search Analytics
            </h1>
            <p className="text-gray-600 mb-8">Most popular search queries</p>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {analytics.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="w-24 h-24 mx-auto text-gray-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-xl text-gray-600">No analytics data yet</p>
                <p className="text-gray-500 mt-2">
                  Start searching to see popular queries
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {analytics.map((item, index) => {
                  const percentage = (item.count / maxCount) * 100;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleSelectQuery(item.query)}
                          className="text-lg font-medium text-gray-800 hover:text-purple-600 transition-colors"
                        >
                          {index + 1}. {item.query}
                        </button>
                        <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {item.count}{" "}
                          {item.count === 1 ? "search" : "searches"}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
