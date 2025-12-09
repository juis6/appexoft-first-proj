import { prisma } from "../lib/prisma.js"

const SEARCH_CACHE_TTL = 24
const VIDEO_CACHE_TTL = 168

class CacheService {
    async getSearchCache(query, pageToken = null) {
        try {
            const cache = await prisma.searchCache.findUnique({
                where: {
                    query_pageToken: {
                        query: query.trim(),
                        pageToken: pageToken || '',
                    },
                },
            });

            if (!cache) return null;

            if (new Date() > cache.expiresAt) {
                await this.deleteSearchCache(query, pageToken);
                return null;
            }

            const videoIds = cache.results;
            const videos = await prisma.video.findMany({
                where: {
                    videoId: { in: videoIds },
                },
                select: {
                    videoId: true,
                    title: true,
                    description: true,
                    thumbnailUrl: true,
                    publishedAt: true,
                },
            });

            const sortedVideos = videoIds
                .map(id => videos.find(v => v.videoId === id))
                .filter(Boolean);

            return {
                results: sortedVideos,
                totalResults: cache.totalResults,
                nextPageToken: cache.nextPageToken,
                prevPageToken: cache.prevPageToken,
            };
        } catch (error) {
            console.error('Error getting search cache:', error);
            return null;
        }
    }

    async setSearchCache(query, pageToken, searchResult) {
        try {
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + SEARCH_CACHE_TTL);

            for (const video of searchResult.results) {
                await prisma.video.upsert({
                    where: { videoId: video.videoId },
                    update: {
                        title: video.title,
                        description: video.description,
                        thumbnailUrl: video.thumbnailUrl,
                        publishedAt: new Date(video.publishedAt),
                    },
                    create: {
                        videoId: video.videoId,
                        title: video.title,
                        description: video.description,
                        thumbnailUrl: video.thumbnailUrl,
                        publishedAt: new Date(video.publishedAt),
                    },
                });
            }

            const videoIds = searchResult.results.map(v => v.videoId);

            await prisma.searchCache.upsert({
                where: {
                    query_pageToken: {
                        query: query.trim(),
                        pageToken: pageToken || '',
                    },
                },
                update: {
                    results: videoIds,
                    totalResults: searchResult.totalResults,
                    nextPageToken: searchResult.nextPageToken,
                    prevPageToken: searchResult.prevPageToken,
                    expiresAt,
                },
                create: {
                    query: query.trim(),
                    pageToken: pageToken || '',
                    results: videoIds,
                    totalResults: searchResult.totalResults,
                    nextPageToken: searchResult.nextPageToken,
                    prevPageToken: searchResult.prevPageToken,
                    expiresAt,
                },
            });

            console.log(`Cached search results for: "${query}"`);
        } catch (error) {
            console.error('Error setting search cache:', error);
        }
    }

    async deleteSearchCache(query, pageToken = null) {
        try {
            await prisma.searchCache.delete({
                where: {
                    query_pageToken: {
                        query: query.trim(),
                        pageToken: pageToken || '',
                    },
                },
            });
        } catch (error) {
            console.error('Error deleting search cache:', error);
        }
    }

    async getVideoCache(videoId) {
        try {
            const video = await prisma.video.findUnique({
                where: { videoId },
            });

            if (!video) return null;

            const cacheAge = Date.now() - video.updatedAt.getTime();
            const maxAge = VIDEO_CACHE_TTL * 60 * 60 * 1000;

            if (cacheAge > maxAge) return null;

            if (video.viewCount === null) return null;

            return {
                videoId: video.videoId,
                title: video.title,
                description: video.description,
                thumbnailUrl: video.thumbnailUrl,
                publishedAt: video.publishedAt.toISOString(),
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
            };
        } catch (error) {
            console.error('Error getting video cache:', error);
            return null;
        }
    }

    async setVideoCache(videoDetails) {
        try {
            await prisma.video.upsert({
                where: { videoId: videoDetails.videoId },
                update: {
                    title: videoDetails.title,
                    description: videoDetails.description,
                    thumbnailUrl: videoDetails.thumbnailUrl,
                    publishedAt: new Date(videoDetails.publishedAt),
                    viewCount: videoDetails.viewCount,
                    likeCount: videoDetails.likeCount,
                    commentCount: videoDetails.commentCount,
                },
                create: {
                    videoId: videoDetails.videoId,
                    title: videoDetails.title,
                    description: videoDetails.description,
                    thumbnailUrl: videoDetails.thumbnailUrl,
                    publishedAt: new Date(videoDetails.publishedAt),
                    viewCount: videoDetails.viewCount,
                    likeCount: videoDetails.likeCount,
                    commentCount: videoDetails.commentCount,
                },
            });

            console.log(`Cached video details: ${videoDetails.videoId}`);
        } catch (error) {
            console.error('Error setting video cache:', error);
        }
    }

    async clearExpiredCache() {
        try {
            const now = new Date();

            const deletedSearches = await prisma.searchCache.deleteMany({
                where: { expiresAt: { lt: now } },
            });

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);

            const deletedVideos = await prisma.video.deleteMany({
                where: { updatedAt: { lt: cutoffDate } },
            });

            console.log(`Cleared cache: ${deletedSearches.count} searches, ${deletedVideos.count} videos`);

            return {
                deletedSearches: deletedSearches.count,
                deletedVideos: deletedVideos.count,
            };
        } catch (error) {
            console.error('Error clearing expired cache:', error);
            return { deletedSearches: 0, deletedVideos: 0 };
        }
    }
}

export const cacheService = new CacheService();