import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import VideoCard from "../components/VideoCard";
import { apiClient } from "../lib/api";
import type { Video, SearchResult } from "../types";

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [searchData, setSearchData] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stateSearchQuery = location.state?.searchQuery;
    const statePageToken = location.state?.pageToken;

    if (stateSearchQuery) {
      setSearchQuery(stateSearchQuery);
    }
    if (statePageToken) {
      setPageToken(statePageToken);
    }
  }, [location.state]);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    }
  }, [searchQuery, pageToken]);

  const performSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.searchVideos(searchQuery, pageToken, 12);
      setSearchData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPageToken(undefined);
  };

  const handleVideoClick = (videoId: string) => {
    navigate(`/video/${videoId}`, {
      state: {
        searchQuery,
        pageToken: searchData?.nextPageToken || undefined,
      },
    });
  };

  const shouldShowResults =
    !loading && !error && searchData?.results && searchData.results.length > 0;

  return (
    <div className="min-h-screen w-full bg-gradient-to-r from-purple-700 via-blue-600 to-cyan-500 text-white flex flex-col items-center p-8">
      <header className="mb-12 w-full max-w-7xl text-center">
        <h1 className="text-6xl font-extrabold mb-4 drop-shadow-lg">
          YouTube Video Search
        </h1>
        <p className="text-xl text-gray-200 drop-shadow-md">
          Discover and explore amazing videos
        </p>
      </header>

      <div className="w-full max-w-4xl mb-12 flex justify-center">
        <SearchBar
          onSearch={handleSearch}
          isLoading={loading}
          initialValue={searchQuery}
        />
      </div>

      <main className="w-full max-w-7xl">
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/20 rounded-3xl shadow-lg">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-white border-solid"></div>
            <p className="mt-8 text-2xl font-semibold">Searching videos...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-600 bg-opacity-80 rounded-3xl p-10 text-center shadow-lg">
            <h2 className="text-3xl font-bold mb-4">Oops!</h2>
            <p className="text-xl mb-6">{error}</p>
            <button
              onClick={() => performSearch()}
              className="px-8 py-4 bg-white text-red-600 rounded-full font-bold hover:bg-gray-100 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          searchQuery &&
          searchData?.results &&
          searchData.results.length === 0 && (
            <div className="bg-white/20 rounded-3xl p-10 text-center shadow-lg">
              <p className="text-2xl">
                No videos found. Try a different search!
              </p>
            </div>
          )}

        {shouldShowResults && (
          <>
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
              {searchData.results.map((video: Video) => (
                <VideoCard
                  key={video.videoId}
                  video={video}
                  onClick={() => handleVideoClick(video.videoId)}
                />
              ))}
            </section>

            {(searchData.prevPageToken || searchData.nextPageToken) && (
              <div className="flex justify-center gap-6 mt-12">
                <button
                  onClick={() =>
                    setPageToken(searchData.prevPageToken || undefined)
                  }
                  disabled={!searchData.prevPageToken}
                  className="px-8 py-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  ← Previous
                </button>
                <button
                  onClick={() =>
                    setPageToken(searchData.nextPageToken || undefined)
                  }
                  disabled={!searchData.nextPageToken}
                  className="px-8 py-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-40 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
