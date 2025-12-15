import type { VideoCardProps } from "../types";
import { formatDistanceToNow } from "date-fns";

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrl
    .replace("default.jpg", "maxresdefault.jpg")
    .replace("mqdefault.jpg", "maxresdefault.jpg")
    .replace("hqdefault.jpg", "maxresdefault.jpg");

  const formatViewCount = (count?: number) => {
    if (!count) return "0 views";
    return `${count.toLocaleString()} views`;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20"
    >
      <div className="relative aspect-video overflow-hidden bg-gray-800">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes("maxresdefault")) {
              target.src = video.thumbnailUrl
                .replace("default.jpg", "hqdefault.jpg")
                .replace("mqdefault.jpg", "hqdefault.jpg");
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors duration-200">
          {video.title}
        </h3>

        <p className="text-sm text-gray-200 line-clamp-2 mb-4">
          {video.description || "No description available"}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-300">
            {formatDistanceToNow(new Date(video.publishedAt), {
              addSuffix: true,
            })}
          </span>

          <div className="flex items-center space-x-2">
            <span className="flex items-center text-gray-300">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
              {formatViewCount(video.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
