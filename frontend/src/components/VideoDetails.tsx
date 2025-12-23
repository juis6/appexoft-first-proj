import { useState, useRef, useEffect } from "react";
import YouTube from "react-youtube";
import type { VideoDetailsProps } from "../types";
import { formatDistanceToNow } from "date-fns";

export default function VideoDetails({ video }: VideoDetailsProps) {
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);
  const playerRef = useRef<any>(null);

  const thumbnailUrl =
    video.thumbnail
      ?.replace("default.jpg", "maxresdefault.jpg")
      ?.replace("mqdefault.jpg", "maxresdefault.jpg")
      ?.replace("hqdefault.jpg", "maxresdefault.jpg") || video.thumbnail;

  const opts = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 0,
      controls: 1,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      fs: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin,
      iv_load_policy: 3,
      cc_load_policy: 0,
      hl: "en",
      cc_lang_pref: "en",
      host: "https://www.youtube-nocookie.com",
    },
  };

  const handleStateChange = (event: any) => {
    const state = event.data;
    if (state === 1) {
      setPlayerError(null);
    }
  };

  const handleError = (error: any) => {
    console.error("YouTube Player Error:", error);
    setPlayerError("Error playing video. Please try again.");
    try {
      playerRef.current?.internalPlayer?.stopVideo();
      setTimeout(() => {
        playerRef.current?.internalPlayer?.playVideo();
      }, 1000);
    } catch (e) {
      console.error("Error recovering from player error:", e);
    }
  };

  const handleReady = (event: any) => {
    playerRef.current = event.target;
    setIsPlayerReady(true);
  };

  const formatViewCount = (count?: string) => {
    if (!count) return "0 views";
    const numCount = parseInt(count, 10);
    return isNaN(numCount) ? "0 views" : `${numCount.toLocaleString()} views`;
  };

  const formatLikeCount = (count?: string) => {
    if (!count) return "0";
    const numCount = parseInt(count, 10);
    return isNaN(numCount) ? "0" : numCount.toLocaleString();
  };

  const formatCommentCount = (count?: string) => {
    if (!count) return "0";
    const numCount = parseInt(count, 10);
    return isNaN(numCount) ? "0" : numCount.toLocaleString();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-white/20">
      <div className="relative bg-black aspect-video">
        <YouTube
          videoId={video.videoId}
          opts={opts}
          onReady={handleReady}
          onError={handleError}
          onStateChange={handleStateChange}
          className="w-full h-full"
          iframeClassName="w-full h-full"
        />

        {!isPlayerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-14 h-14 text-blue-600"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {playerError && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10">
            <div className="text-center p-6">
              <p className="text-white text-lg mb-4">{playerError}</p>
              <button
                onClick={() => {
                  setPlayerError(null);
                  playerRef.current?.internalPlayer?.playVideo();
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {video.title}
        </h1>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 font-medium">
              {formatViewCount(video.viewCount)}
            </span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">
              {formatDistanceToNow(new Date(video.publishedAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <span className="font-medium">
                {formatLikeCount(video.likeCount)}
              </span>
            </button>

            <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
              <svg
                className="w-6 h-6 group-hover:scale-110 transition-transform"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
              </svg>
              <span className="font-medium">
                {formatCommentCount(video.commentCount)}
              </span>
            </button>
          </div>
        </div>

        <div className="prose prose-lg max-w-none text-gray-600">
          <p className="whitespace-pre-wrap">{video.description}</p>
        </div>
      </div>
    </div>
  );
}
