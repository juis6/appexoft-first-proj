import { createBrowserRouter } from 'react-router-dom';
import HomePage from './pages/HomePage';
import VideoPage from './pages/VideoPage';

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <HomePage />,
    },
    {
      path: "/video/:videoId",
      element: <VideoPage />,
    }
  ],
  {
    future: {
      v7_startTransition: true
    }
  }
); 