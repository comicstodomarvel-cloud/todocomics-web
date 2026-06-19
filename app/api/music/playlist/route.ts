import { NextResponse } from "next/server"

export async function GET() {
  const apiKey = process.env.YOUTUBE_API_KEY
  const playlistIds = process.env.YOUTUBE_PLAYLIST_IDS

  if (!apiKey || !playlistIds) {
    return NextResponse.json(
      { error: "YouTube API key or playlist IDs not configured" },
      { status: 503 }
    )
  }

  try {
    const ids = playlistIds.split(",").map((id) => id.trim())
    const allTracks: unknown[] = []
    const seen = new Set<string>()

    for (const playlistId of ids) {
      let nextPageToken: string | undefined
      do {
        const params = new URLSearchParams({
          part: "snippet,contentDetails",
          maxResults: "50",
          playlistId,
          key: apiKey,
        })
        if (nextPageToken) params.set("pageToken", nextPageToken)

        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?${params}`
        )
        if (!res.ok) {
          const errorData = await res.text()
          console.error(`YouTube API error for playlist ${playlistId}:`, errorData)
          break
        }

        const data = await res.json()
        for (const item of data.items || []) {
          const videoId = item.snippet?.resourceId?.videoId
          if (!videoId || seen.has(videoId)) continue
          seen.add(videoId)

          allTracks.push({
            videoId,
            title: item.snippet.title,
            artist: item.snippet.videoOwnerChannelTitle || "Desconocido",
            thumbnail:
              item.snippet.thumbnails?.high?.url ||
              item.snippet.thumbnails?.default?.url ||
              "",
            duration: parseDuration(item.contentDetails?.duration),
          })
        }
        nextPageToken = data.nextPageToken
      } while (nextPageToken)
    }

    return NextResponse.json({ tracks: allTracks, total: allTracks.length })
  } catch (error) {
    console.error("Failed to fetch playlist:", error)
    return NextResponse.json(
      { error: "Failed to fetch playlist" },
      { status: 500 }
    )
  }
}

function parseDuration(isoDuration?: string): number {
  if (!isoDuration) return 180
  const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  const hours = parseInt(match?.[1]?.replace("H", "") || "0")
  const minutes = parseInt(match?.[2]?.replace("M", "") || "0")
  const seconds = parseInt(match?.[3]?.replace("S", "") || "0")
  return hours * 3600 + minutes * 60 + seconds
}
