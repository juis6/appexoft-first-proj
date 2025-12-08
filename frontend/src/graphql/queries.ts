import { gql } from '@apollo/client';

export const SEARCH_VIDEOS = gql`
  query SearchVideos($q: String!, $pageToken: String, $maxResults: Float) {
    searchVideos(q: $q, pageToken: $pageToken, maxResults: $maxResults) {
      results {
        videoId
        title
        description
        thumbnailUrl
        publishedAt
      }
      totalResults
      nextPageToken
      prevPageToken
    }
  }
`;

export const GET_VIDEO_DETAILS = gql`
  query GetVideoDetails($videoId: String!) {
    videoDetails(videoId: $videoId) {
      videoId
      title
      description
      thumbnailUrl
      publishedAt
      viewCount
      likeCount
      commentCount
    }
  }
`;

export const GET_SEARCH_HISTORY = gql`
  query GetSearchHistory {
    searchHistory {
      history {
        query
        timestamp
      }
    }
  }
`;

export const GET_SEARCH_ANALYTICS = gql`
  query GetSearchAnalytics {
    searchAnalytics {
      query
      count
    }
  }
`; 