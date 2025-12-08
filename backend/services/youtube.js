const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || ""

class YouTubeService {
    constructor() {
        if (!RAPIDAPI_KEY) {
            console.warn('WARNING: RAPIDAPI_KEY not set');
        } else {
            console.log('RapidAPI configured');
        }
    }

    async searchVideos(query, pageToken, maxResults = 12) {
        if (!RAPIDAPI_KEY) {
            throw new Error('RAPIDAPI_KEY is required');
        }

        const url = 'https://youtube-v31.p.rapidapi.com/search';
        const params = new URLSearchParams({
            q: query,
            maxResults: maxResults.toString(),
            part: 'snippet',
            type: 'video',
        });

        if (pageToken) {
            params.append('pageToken', pageToken);
        }

        const response = await fetch(`${url}?${params}`, {
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'youtube-v31.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`RapidAPI error: ${response.status}`);
        }

        const data = await response.json();

        const results = data.items.map(item => ({
            videoId: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnailUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
            publishedAt: item.snippet.publishedAt,
        }));

        return {
            results,
            totalResults: data.pageInfo?.totalResults || 0,
            nextPageToken: data.nextPageToken || null,
            prevPageToken: data.prevPageToken || null,
        };
    }
}

export const youtubeService = new YouTubeService();