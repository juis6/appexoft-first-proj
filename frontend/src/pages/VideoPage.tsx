import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@apollo/client';
import { GET_VIDEO_DETAILS } from '../graphql/queries';
import type { VideoDetails as VideoDetailsType } from '../types';
import VideoDetails from '../components/VideoDetails';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const searchQuery = location.state?.searchQuery || '';
  const pageToken = location.state?.pageToken || undefined;

  const { data, loading, error } = useQuery(GET_VIDEO_DETAILS, {
    variables: { videoId },
  });

  const handleBackToSearch = () => {
    navigate('/', { 
      state: { 
        searchQuery,
        pageToken
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-500 border-t-transparent mx-auto"></div>
                <p className="mt-8 text-lg text-gray-600 font-medium">Loading video details...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center py-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-full blur-xl opacity-20"></div>
              <div className="relative text-red-500 mb-6">
                <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-2xl text-gray-800 mb-4 font-semibold">Error loading video</p>
              <p className="text-gray-600 mb-8">Please try again later</p>
              <button
                onClick={handleBackToSearch}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Back to Search
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const video: VideoDetailsType = data.videoDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-blue-600 to-cyan-500 py-12">
      <div className="container mx-auto px-4">
        <VideoDetails video={video} />
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleBackToSearch}
            className="px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl border border-white/20 hover:bg-white/95 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back to Search
          </button>
        </div>
      </div>
    </div>
  );
}
