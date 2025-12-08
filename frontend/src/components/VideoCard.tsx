import type { VideoCardProps } from '../types';
import { formatDistanceToNow } from 'date-fns';

export default function VideoCard({ video, onClick }: VideoCardProps) {
  const thumbnailUrl = video.thumbnailUrl
    .replace('default.jpg', 'maxresdefault.jpg')
    .replace('mqdefault.jpg', 'maxresdefault.jpg')
    .replace('hqdefault.jpg', 'maxresdefault.jpg');

  const formatViewCount = (count?: number) => {
    if (!count) return '0 views';
    return `${count.toLocaleString()} views`;
  };

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('maxresdefault')) {
              target.src = video.thumbnailUrl
                .replace('default.jpg', 'hqdefault.jpg')
                .replace('mqdefault.jpg', 'hqdefault.jpg');
            }
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-sm font-medium line-clamp-2">{video.title}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-blue-100 mb-2 line-clamp-2 group-hover:text-blue-200 transition-colors duration-200">
          {video.title}
        </h3>
        <p className="text-sm text-blue-50/80 line-clamp-2 mb-3">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-100/70">
            {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
          </span>
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-blue-100/70">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
              {formatViewCount(video.viewCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
