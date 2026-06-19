export interface Track {
  videoId: string
  title: string
  artist: string
  thumbnail: string
  duration: number
}

const MOCK_PLAYLIST: Track[] = [
  { videoId: "KJZnCjN1-hY", title: "Spider-Man Theme (2002)", artist: "Danny Elfman", thumbnail: "https://img.youtube.com/vi/KJZnCjN1-hY/hqdefault.jpg", duration: 280 },
  { videoId: "8ZgB3l_FdRc", title: "X-Men Theme (2000)", artist: "Michael Kamen", thumbnail: "https://img.youtube.com/vi/8ZgB3l_FdRc/hqdefault.jpg", duration: 310 },
  { videoId: "LND9kQ0G0Ms", title: "Batman Theme (1989)", artist: "Danny Elfman", thumbnail: "https://img.youtube.com/vi/LND9kQ0G0Ms/hqdefault.jpg", duration: 240 },
  { videoId: "iVB44uEit5E", title: "Superman March (1978)", artist: "John Williams", thumbnail: "https://img.youtube.com/vi/iVB44uEit5E/hqdefault.jpg", duration: 260 },
  { videoId: "DfuDEny7xq0", title: "Iron Man (2008) - Driving With The Top Down", artist: "Ramin Djawadi", thumbnail: "https://img.youtube.com/vi/DfuDEny7xq0/hqdefault.jpg", duration: 215 },
  { videoId: "R9bP1E2SpXs", title: "The Dark Knight - Why So Serious?", artist: "Hans Zimmer", thumbnail: "https://img.youtube.com/vi/R9bP1E2SpXs/hqdefault.jpg", duration: 540 },
  { videoId: "4J4HktaDIDc", title: "Captain America Theme (The First Avenger)", artist: "Alan Silvestri", thumbnail: "https://img.youtube.com/vi/4J4HktaDIDc/hqdefault.jpg", duration: 210 },
  { videoId: "8JzuwcJ4iFw", title: "Thor Theme (2011)", artist: "Patrick Doyle", thumbnail: "https://img.youtube.com/vi/8JzuwcJ4iFw/hqdefault.jpg", duration: 195 },
  { videoId: "H0aIRK49_EI", title: "The Avengers Theme (2012)", artist: "Alan Silvestri", thumbnail: "https://img.youtube.com/vi/H0aIRK49_EI/hqdefault.jpg", duration: 180 },
  { videoId: "ZxTq7q8tscI", title: "Man of Steel - What Are You Going To Do When You Are Not Saving The World?", artist: "Hans Zimmer", thumbnail: "https://img.youtube.com/vi/ZxTq7q8tscI/hqdefault.jpg", duration: 365 },
  { videoId: "XylhUHg2dhQ", title: "Wonder Woman - Amazons of Themyscira", artist: "Hans Zimmer", thumbnail: "https://img.youtube.com/vi/XylhUHg2dhQ/hqdefault.jpg", duration: 240 },
  { videoId: "P6T7GxO3t2A", title: "Batman Begins - Molossus", artist: "Hans Zimmer & James Newton Howard", thumbnail: "https://img.youtube.com/vi/P6T7GxO3t2A/hqdefault.jpg", duration: 290 },
  { videoId: "sR_JfuOCeDw", title: "Spider-Man 2 Theme (2004)", artist: "Danny Elfman", thumbnail: "https://img.youtube.com/vi/sR_JfuOCeDw/hqdefault.jpg", duration: 300 },
  { videoId: "QaFhTBUBmWQ", title: "X2: X-Men United - Suite", artist: "John Ottman", thumbnail: "https://img.youtube.com/vi/QaFhTBUBmWQ/hqdefault.jpg", duration: 330 },
  { videoId: "OXL31TqZ9aY", title: "Fantastic Four Theme (2005)", artist: "John Ottman", thumbnail: "https://img.youtube.com/vi/OXL31TqZ9aY/hqdefault.jpg", duration: 195 },
  { videoId: "L4Omd6M-p-w", title: "Daredevil Theme (2003)", artist: "Graeme Revell", thumbnail: "https://img.youtube.com/vi/L4Omd6M-p-w/hqdefault.jpg", duration: 180 },
  { videoId: "H-s_5cWMF3A", title: "Hulk Theme (2003)", artist: "Danny Elfman", thumbnail: "https://img.youtube.com/vi/H-s_5cWMF3A/hqdefault.jpg", duration: 250 },
  { videoId: "f7HnBPxEGpg", title: "Blade Theme (1998)", artist: "Mark Isham", thumbnail: "https://img.youtube.com/vi/f7HnBPxEGpg/hqdefault.jpg", duration: 220 },
  { videoId: "jA3GgPgYg6M", title: "Hellboy Theme (2004)", artist: "Marco Beltrami", thumbnail: "https://img.youtube.com/vi/jA3GgPgYg6M/hqdefault.jpg", duration: 240 },
  { videoId: "VVUdmN-26-g", title: "The Incredibles Theme (2004)", artist: "Michael Giacchino", thumbnail: "https://img.youtube.com/vi/VVUdmN-26-g/hqdefault.jpg", duration: 185 },
  { videoId: "qgn4dsU0Gzk", title: "Spider-Man 3 Theme (2007)", artist: "Christopher Young", thumbnail: "https://img.youtube.com/vi/qgn4dsU0Gzk/hqdefault.jpg", duration: 310 },
  { videoId: "iMuo3Dab2Mw", title: "Ghost Rider Theme (2007)", artist: "Christopher Young", thumbnail: "https://img.youtube.com/vi/iMuo3Dab2Mw/hqdefault.jpg", duration: 200 },
  { videoId: "I_TG02RPRB0", title: "Watchmen - The Beginning of the End", artist: "Tyler Bates", thumbnail: "https://img.youtube.com/vi/I_TG02RPRB0/hqdefault.jpg", duration: 290 },
  { videoId: "7ndEO2B7JmI", title: "Kick-Ass Theme (2010)", artist: "John Murphy, Henry Jackman, Marius de Vries, Ilan Eshkeri", thumbnail: "https://img.youtube.com/vi/7ndEO2B7JmI/hqdefault.jpg", duration: 175 },
  { videoId: "vlohZ5T2rCc", title: "Iron Man 2 - Monorail Chase", artist: "John Debney", thumbnail: "https://img.youtube.com/vi/vlohZ5T2rCc/hqdefault.jpg", duration: 255 },
  { videoId: "qE2oXJDjpQ4", title: "The Dark Knight Rises - Rise", artist: "Hans Zimmer", thumbnail: "https://img.youtube.com/vi/qE2oXJDjpQ4/hqdefault.jpg", duration: 340 },
  { videoId: "4GXYi4r50H4", title: "Green Lantern Theme (2011)", artist: "James Newton Howard", thumbnail: "https://img.youtube.com/vi/4GXYi4r50H4/hqdefault.jpg", duration: 230 },
  { videoId: "M3j2nnrhF-8", title: "Thor: The Dark World Theme", artist: "Brian Tyler", thumbnail: "https://img.youtube.com/vi/M3j2nnrhF-8/hqdefault.jpg", duration: 220 },
  { videoId: "2zRl1mu3x-Y", title: "Captain America: The Winter Soldier Theme", artist: "Henry Jackman", thumbnail: "https://img.youtube.com/vi/2zRl1mu3x-Y/hqdefault.jpg", duration: 240 },
  { videoId: "Dhb4obRzP0k", title: "Guardians of the Galaxy - Come and Get Your Love", artist: "Redbone", thumbnail: "https://img.youtube.com/vi/Dhb4obRzP0k/hqdefault.jpg", duration: 180 },
  { videoId: "ipbsAVK0WtM", title: "Avengers: Age of Ultron Theme", artist: "Brian Tyler & Danny Elfman", thumbnail: "https://img.youtube.com/vi/ipbsAVK0WtM/hqdefault.jpg", duration: 210 },
  { videoId: "Kj2m6FbuFzo", title: "Ant-Man Theme (2015)", artist: "Christophe Beck", thumbnail: "https://img.youtube.com/vi/Kj2m6FbuFzo/hqdefault.jpg", duration: 185 },
  { videoId: "BrJtE31_hQ8", title: "Deadpool - Angel of the Morning", artist: "Juice Newton", thumbnail: "https://img.youtube.com/vi/BrJtE31_hQ8/hqdefault.jpg", duration: 190 },
  { videoId: "J8Qh3C-hBLI", title: "Batman v Superman - Is She With You?", artist: "Hans Zimmer & Junkie XL", thumbnail: "https://img.youtube.com/vi/J8Qh3C-hBLI/hqdefault.jpg", duration: 340 },
  { videoId: "0bqENeDx8_0", title: "Suicide Squad - Purple Lamborghini", artist: "Skrillex & Rick Ross", thumbnail: "https://img.youtube.com/vi/0bqENeDx8_0/hqdefault.jpg", duration: 210 },
  { videoId: "JhM1MmxLwFc", title: "Doctor Strange Theme (2016)", artist: "Michael Giacchino", thumbnail: "https://img.youtube.com/vi/JhM1MmxLwFc/hqdefault.jpg", duration: 200 },
  { videoId: "KFaqGGGOcJI", title: "Logan Theme (2017)", artist: "Marco Beltrami", thumbnail: "https://img.youtube.com/vi/KFaqGGGOcJI/hqdefault.jpg", duration: 280 },
  { videoId: "j_LCZQyDBSY", title: "Spider-Man: Homecoming Theme", artist: "Michael Giacchino", thumbnail: "https://img.youtube.com/vi/j_LCZQyDBSY/hqdefault.jpg", duration: 195 },
  { videoId: "PwZR-mLyUeA", title: "Wonder Woman - No Man's Land", artist: "Rupert Gregson-Williams", thumbnail: "https://img.youtube.com/vi/PwZR-mLyUeA/hqdefault.jpg", duration: 320 },
  { videoId: "y5t0hL4JZ3M", title: "Justice League Theme (2017)", artist: "Danny Elfman", thumbnail: "https://img.youtube.com/vi/y5t0hL4JZ3M/hqdefault.jpg", duration: 270 },
]

function getDailyPlaylistSelection(allIds: string[], count: number): string[] {
  const today = new Date()
  const dateStr = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`

  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    const char = dateStr.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  const shuffled = [...allIds]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((hash * (i + 1) * 2654435761) % (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export const DAILY_PLAYLIST_COUNT = Number(process.env.YOUTUBE_DAILY_COUNT) || 2

export async function getPlaylist(): Promise<Track[]> {
  const apiKey = process.env.YOUTUBE_API_KEY
  const playlistIds = process.env.YOUTUBE_PLAYLIST_IDS

  if (!apiKey || !playlistIds) {
    return MOCK_PLAYLIST
  }

  try {
    const allIds = playlistIds.split(",").map((id) => id.trim())
    const dailyIds = allIds.length > DAILY_PLAYLIST_COUNT
      ? getDailyPlaylistSelection(allIds, DAILY_PLAYLIST_COUNT)
      : allIds

    const allTracks: Track[] = []
    const seen = new Set<string>()

    for (const playlistId of dailyIds) {
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
        if (!res.ok) continue

        const data = await res.json()
        for (const item of data.items || []) {
          const videoId = item.snippet?.resourceId?.videoId
          if (!videoId || seen.has(videoId)) continue
          seen.add(videoId)

          allTracks.push({
            videoId,
            title: item.snippet.title,
            artist: item.snippet.videoOwnerChannelTitle || "Desconocido",
            thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
            duration: parseDuration(item.contentDetails?.duration),
          })
        }
        nextPageToken = data.nextPageToken
      } while (nextPageToken)
    }

    if (allTracks.length === 0) return MOCK_PLAYLIST
    return allTracks
  } catch {
    return MOCK_PLAYLIST
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
