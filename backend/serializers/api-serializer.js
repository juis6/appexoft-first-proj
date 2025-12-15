class YoutubeSerializer {
    serializeSearchItem(item) {
        return {
            videoId: item.id?.videoId,
            title: item.snippet?.title,
            description: item.snippet?.description,
            publishedAt: item.snippet?.publishedAt,
            thumbnailUrl:
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                item.snippet?.thumbnails?.default?.url
        }
    }

    serializeSearchResult(data) {
        return {
            result: data.items?.map(item => this.serializeSearchItem(item)),
            totalResults: data.pageInfo?.totalResults,
            nextPageToken: data.nextPageToken,
            prevPageToken: data.prevPageToken
        }
    }

    serializeVideoDetails(item) {
        return {
            videoId: item.id,
            title: item.snippet?.title,
            description: item.snippet?.description,
            thumbnailUrl:
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                item.snippet?.thumbnails?.default?.url,
            publishedAt: item.snippet?.publishedAt,
            viewCount: item.statistics?.viewCount,
            likeCount: item.statistics?.likeCount,
            commentCount: item.statistics?.commentCount
        }
    }

    serializeHistory(history) {
        return {
            history: history.map(item => ({
                query: item.query,
                timestamp: item.timestamp
            }))
        }
    }

    serializeAnalytics(analytics) {
        return analytics.map(item => ({
            query: item.query,
            count: item._count?.query
        }))
    }
}

export const youtubeSerializer = new YoutubeSerializer()
