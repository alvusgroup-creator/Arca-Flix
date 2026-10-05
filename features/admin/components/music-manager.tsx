"use client"

import { useActionState, useState, useTransition } from "react"
import { Pencil, Plus, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { formatClock } from "@/utils/format"
import type { AdminTrack } from "@/services/admin-content"
import { deleteTrack, saveMusicMeta, saveTrack } from "../actions"
import { AdminCard, Field, SubmitButton, inputClass, useActionToast } from "./form-kit"
import { UploadField } from "./upload-field"

export function MusicManager({
  contentId,
  music,
}: {
  contentId: string
  music: { kind: "album" | "playlist"; artist: string; tracks: AdminTrack[] } | null
}) {
  const [metaState, metaAction] = useActionState(saveMusicMeta, null)
  useActionToast(metaState)
  const [editing, setEditing] = useState<AdminTrack | "new" | null>(null)
  const [, startTransition] = useTransition()
  const tracks = music?.tracks ?? []

  return (
    <div className="space-y-6">
      <AdminCard title="Álbum ou playlist">
        <form action={metaAction} className="flex flex-wrap items-end gap-3">
          <input type="hidden" name="contentId" value={contentId} />
          <Field label="Tipo" htmlFor="music-kind" className="w-44">
            <select id="music-kind" name="kind" defaultValue={music?.kind ?? "album"} className={inputClass}>
              <option value="album">Álbum</option>
              <option value="playlist">Playlist</option>
            </select>
          </Field>
          <Field label="Artista (álbuns)" htmlFor="music-artist" className="min-w-56 flex-1">
            <input id="music-artist" name="artist" defaultValue={music?.artist} placeholder="Ex.: Coral Arca Flix" className={inputClass} />
          </Field>
          <SubmitButton>Salvar</SubmitButton>
        </form>
      </AdminCard>

      <AdminCard
        title="Músicas"
        description="Áudio vai para o bucket privado e só é entregue a assinantes."
        actions={
          <Button size="sm" onClick={() => setEditing("new")}>
            <Plus /> Música
          </Button>
        }
      >
        <ul className="divide-y divide-input overflow-hidden rounded-2xl border border-input">
          {tracks.map((t) =>
            editing !== "new" && editing?.id === t.id ? (
              <li key={t.id} className="p-3">
                <TrackForm contentId={contentId} track={t} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={t.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="w-8 text-center font-bold text-grape-600">{t.trackNumber}</span>
                <span className="flex-1 truncate font-medium">{t.title}</span>
                <span className="text-muted-foreground tabular-nums">{formatClock(t.durationSeconds)}</span>
                <Button size="icon-sm" variant="ghost" aria-label={`Editar ${t.title}`} onClick={() => setEditing(t)}>
                  <Pencil />
                </Button>
                <ConfirmDialog
                  title={`Excluir "${t.title}"?`}
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() =>
                    startTransition(async () => {
                      const res = await deleteTrack(t.id, contentId)
                      if (res?.error) toast.error(res.error)
                    })
                  }
                  trigger={
                    <Button size="icon-sm" variant="ghost" aria-label={`Excluir ${t.title}`}>
                      <Trash />
                    </Button>
                  }
                />
              </li>
            )
          )}
          {!tracks.length && editing !== "new" && <li className="p-4 text-sm text-muted-foreground">Nenhuma música ainda.</li>}
          {editing === "new" && (
            <li className="p-3">
              <TrackForm contentId={contentId} defaultNumber={tracks.length + 1} onDone={() => setEditing(null)} />
            </li>
          )}
        </ul>
      </AdminCard>
    </div>
  )
}

function TrackForm({
  contentId,
  track,
  defaultNumber,
  onDone,
}: {
  contentId: string
  track?: AdminTrack
  defaultNumber?: number
  onDone: () => void
}) {
  const [state, action] = useActionState(async (prev: Parameters<typeof saveTrack>[0], fd: FormData) => {
    const res = await saveTrack(prev, fd)
    if (res?.success) onDone()
    return res
  }, null)
  useActionToast(state)
  const [duration, setDuration] = useState(String(track?.durationSeconds ?? ""))
  const key = track?.id ?? "new"

  // Lê a duração do arquivo de áudio escolhido.
  function readDuration(file: File) {
    const audio = document.createElement("audio")
    audio.preload = "metadata"
    audio.src = URL.createObjectURL(file)
    audio.onloadedmetadata = () => {
      setDuration(String(Math.round(audio.duration)))
      URL.revokeObjectURL(audio.src)
    }
  }

  return (
    <form action={action} className="grid gap-3 rounded-2xl bg-surface-2 p-4 md:grid-cols-6">
      {track && <input type="hidden" name="id" value={track.id} />}
      <input type="hidden" name="contentId" value={contentId} />
      <Field label="Nº" htmlFor={`tr-n-${key}`}>
        <input id={`tr-n-${key}`} name="trackNumber" type="number" min={1} defaultValue={track?.trackNumber ?? defaultNumber} className={inputClass} />
      </Field>
      <Field label="Título" htmlFor={`tr-t-${key}`} className="md:col-span-3">
        <input id={`tr-t-${key}`} name="title" required defaultValue={track?.title} className={inputClass} />
      </Field>
      <Field label="Duração (s)" htmlFor={`tr-d-${key}`} className="md:col-span-2">
        <input id={`tr-d-${key}`} name="durationSeconds" type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Arquivo de áudio" htmlFor={`tr-a-${key}`} hint="MP3/AAC. Caminho no bucket privado ‘audio’ ou URL." className="md:col-span-6">
        <UploadField id={`tr-a-${key}`} name="audioUrl" bucket="audio" accept="audio/*" defaultValue={track?.audioUrl} onUploaded={readDuration} />
      </Field>
      <Field label="Capa (opcional)" htmlFor={`tr-c-${key}`} hint="Vazio = usa a capa do álbum." className="md:col-span-6">
        <UploadField id={`tr-c-${key}`} name="coverUrl" bucket="images" accept="image/*" defaultValue={track?.coverUrl} />
      </Field>
      <div className="flex justify-end gap-2 md:col-span-6">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <SubmitButton>{track ? "Salvar música" : "Adicionar música"}</SubmitButton>
      </div>
    </form>
  )
}
