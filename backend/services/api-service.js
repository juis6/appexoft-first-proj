import "dotenv/config"

const X_RAPIDAPI_KEY = process.env.X_RAPIDAPI_KEY
const X_RAPIDAPI_HOST = process.env.X_RAPIDAPI_HOST

class YoutubeService {
    constructor() {
        if (!X_RAPIDAPI_KEY) {
            console.warn("WARNING: X_RAPIDAPI_KEY not provided")
        } if (!X_RAPIDAPI_HOST) {
            console.warn("WARNING: X_RAPIDAPI_HOST not provided")
        } else {
            console.log("RapidAPI configured seccessfully")
        }
    }

    async search(query) {
        try {
            const defaults = {
                q: "music",
                part: "snippet,id",
                regionCode: "US",
                maxResults: 50,
                order: "viewCount"
            }
            const params = new URLSearchParams({ ...defaults, ...query })

            const url = `https://youtube-v31.p.rapidapi.com/search?${params.toString()}`
            const options = {
                method: "GET",
                headers: {
                    "x-rapidapi-key": X_RAPIDAPI_KEY,
                    "x-rapidapi-host": X_RAPIDAPI_HOST
                }
            }

            const res = await fetch(url, options)
            return res
        } catch (err) {
            console.error("Search API error:", err.message)
            return null
        }
    }

    async videoDetails(query) {
        try {
            const defaults = {
                part: "contentDetails,snippet,statistics",
                id: "7ghhRHRP6t4"
            }
            const params = new URLSearchParams({ ...defaults, ...query })

            const url = `https://youtube-v31.p.rapidapi.com/videos?${params.toString()}`
            const options = {
                method: "GET",
                headers: {
                    "x-rapidapi-key": X_RAPIDAPI_KEY,
                    "x-rapidapi-host": X_RAPIDAPI_HOST
                }
            }

            const res = await fetch(url, options)
            return res
        } catch (err) {
            console.error("VideoDetails API error:", err.message)
            return null
        }
    }
}

export const youtubeService = new YoutubeService()
