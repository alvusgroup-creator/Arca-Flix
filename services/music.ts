import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoMusic } from "@/lib/demo/data"
import { getContentBySlug } from "@/services/content"
import type { MusicCollection, MusicTrack } from "@/types"

type ArtistEmbed = { name: string } | { name: string }[] | null

interface TrackRowDb {
  id: string
  title: string
  audio_url: string
  cover_url: string | null
  duration: number
  track_number: number
  music_artists: ArtistEmbed
}

const artistName = (a: ArtistEmbed) => (Array.isArray(a) ? a[0]?.name : a?.name) ?? ""

function mapTrack(row: TrackRowDb, cover: string): MusicTrack {
  return {
    id: row.id,
    title: row.title,
    artist: artistName(row.music_artists),
    audioUrl: row.audio_url,
    coverUrl: row.cover_url || cover,
    durationSeconds: row.duration,
    trackNumber: row.track_number,
  }
}

const TRACK_COLUMNS = "id, title, audio_url, cover_url, duration, track_number, music_artists(name)"

export async function getMusicCollection(slug: string): Promise<MusicCollection | null> {
  if (isDemoMode) return demoMusic.find((m) => m.content.slug === slug) ?? null

  const content = await getContentBySlug(slug)
  if (!content || content.type !== "music") return null
  const supabase = await createClient()

  const { data: album } = await supabase
    .from("music_albums")
    .select("id, music_artists(name)")
    .eq("content_id", content.id)
    .maybeSingle()

  if (album) {
    const { data } = await supabase
      .from("music_tracks")
      .select(TRACK_COLUMNS)
      .eq("album_id", album.id)
      .order("track_number")
    return {
      content,
      kind: "album",
      artist: artistName(album.music_artists as ArtistEmbed),
      tracks: ((data ?? []) as TrackRowDb[]).map((t) => mapTrack(t, content.thumbnailUrl)),
    }
  }

  const { data: playlist } = await supabase
    .from("playlists")
    .select(`id, playlist_tracks(position, music_tracks(${TRACK_COLUMNS}))`)
    .eq("content_id", content.id)
    .maybeSingle()
  if (!playlist) return { content, kind: "playlist", artist: "", tracks: [] }

  type PlaylistTrack = { position: number; music_tracks: TrackRowDb | TrackRowDb[] | null }
  const tracks = ((playlist.playlist_tracks ?? []) as PlaylistTrack[])
    .sort((a, b) => a.position - b.position)
    .flatMap((pt, i) => {
      const t = Array.isArray(pt.music_tracks) ? pt.music_tracks[0] : pt.music_tracks
      return t ? [{ ...mapTrack(t, content.thumbnailUrl), trackNumber: i + 1 }] : []
    })
  return { content, kind: "playlist", artist: "Vários artistas", tracks }
}

export function totalDuration(collection: Pick<MusicCollection, "tracks">) {
  return collection.tracks.reduce((sum, t) => sum + t.durationSeconds, 0)
}
