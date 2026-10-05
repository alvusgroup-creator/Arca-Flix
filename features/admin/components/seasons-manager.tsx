"use client"

import { useActionState, useState, useTransition } from "react"
import { ChevronDown, Pencil, Plus, Search, Trash } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/shared/confirm-dialog"
import { Button } from "@/components/ui/button"
import { formatDuration } from "@/utils/format"
import type { AdminEpisode, AdminSeason } from "@/services/admin-content"
import { addSeason, deleteEpisode, deleteSeason, lookupBunnyVideo, saveEpisode } from "../actions"
import { AdminCard, Field, SubmitButton, inputClass, textareaClass, useActionToast } from "./form-kit"
import { UploadField } from "./upload-field"

export function SeasonsManager({ contentId, seasons }: { contentId: string; seasons: AdminSeason[] }) {
  const [state, action] = useActionState(addSeason, null)
  useActionToast(state)
  const nextNumber = Math.max(0, ...seasons.map((s) => s.number)) + 1

  return (
    <AdminCard title="Temporadas e episódios" description="Série → Temporadas → Episódios.">
      <div className="space-y-4">
        {seasons.map((s) => (
          <SeasonBlock key={s.id} contentId={contentId} season={s} />
        ))}
        {!seasons.length && <p className="text-sm text-muted-foreground">Nenhuma temporada ainda.</p>}
      </div>

      <form action={action} className="mt-5 flex flex-wrap items-end gap-3 rounded-2xl bg-surface-2 p-4">
        <input type="hidden" name="contentId" value={contentId} />
        <Field label="Nº" htmlFor="season-number" className="w-24">
          <input id="season-number" name="number" type="number" min={1} defaultValue={nextNumber} key={nextNumber} className={inputClass} />
        </Field>
        <Field label="Título (opcional)" htmlFor="season-title" className="min-w-48 flex-1">
          <input id="season-title" name="title" placeholder={`Temporada ${nextNumber}`} className={inputClass} />
        </Field>
        <SubmitButton>
          <Plus /> Nova temporada
        </SubmitButton>
      </form>
    </AdminCard>
  )
}

function SeasonBlock({ contentId, season }: { contentId: string; season: AdminSeason }) {
  const [open, setOpen] = useState(true)
  const [editing, setEditing] = useState<AdminEpisode | "new" | null>(null)
  const [, startTransition] = useTransition()
  const nextEp = Math.max(0, ...season.episodes.map((e) => e.number)) + 1

  return (
    <div className="rounded-2xl border border-input">
      <div className="flex items-center gap-3 p-3">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex flex-1 items-center gap-2 text-left font-semibold">
          <ChevronDown className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`} />
          {season.title} <span className="text-sm font-normal text-muted-foreground">· {season.episodes.length} episódios</span>
        </button>
        <Button size="sm" variant="secondary" onClick={() => setEditing("new")}>
          <Plus /> Episódio
        </Button>
        <ConfirmDialog
          title={`Excluir ${season.title}?`}
          description="Todos os episódios desta temporada serão excluídos."
          confirmLabel="Excluir"
          destructive
          onConfirm={() =>
            startTransition(async () => {
              const res = await deleteSeason(season.id, contentId)
              if (res?.error) toast.error(res.error)
              else toast.success("Temporada excluída")
            })
          }
          trigger={
            <Button size="icon-sm" variant="ghost" aria-label={`Excluir ${season.title}`}>
              <Trash />
            </Button>
          }
        />
      </div>

      {open && (
        <ul className="divide-y divide-input border-t border-input">
          {season.episodes.map((ep) =>
            editing !== "new" && editing?.id === ep.id ? (
              <li key={ep.id} className="p-3">
                <EpisodeForm contentId={contentId} seasonId={season.id} episode={ep} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={ep.id} className="flex items-center gap-3 px-3 py-2.5 text-sm">
                <span className="w-8 text-center font-bold text-grape-600">{ep.number}</span>
                <span className="flex-1 truncate font-medium">{ep.title}</span>
                <span className="hidden text-muted-foreground sm:inline">{formatDuration(ep.durationSeconds)}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ep.videoId ? "bg-emerald-100 text-emerald-700" : "bg-sun-100 text-orange-700"}`}>
                  {ep.videoId ? "Vídeo ok" : "Sem vídeo"}
                </span>
                <Button size="icon-sm" variant="ghost" aria-label={`Editar ${ep.title}`} onClick={() => setEditing(ep)}>
                  <Pencil />
                </Button>
                <ConfirmDialog
                  title={`Excluir "${ep.title}"?`}
                  confirmLabel="Excluir"
                  destructive
                  onConfirm={() =>
                    startTransition(async () => {
                      const res = await deleteEpisode(ep.id, contentId)
                      if (res?.error) toast.error(res.error)
                    })
                  }
                  trigger={
                    <Button size="icon-sm" variant="ghost" aria-label={`Excluir ${ep.title}`}>
                      <Trash />
                    </Button>
                  }
                />
              </li>
            )
          )}
          {editing === "new" && (
            <li className="p-3">
              <EpisodeForm contentId={contentId} seasonId={season.id} defaultNumber={nextEp} onDone={() => setEditing(null)} />
            </li>
          )}
        </ul>
      )}
    </div>
  )
}

function EpisodeForm({
  contentId,
  seasonId,
  episode,
  defaultNumber,
  onDone,
}: {
  contentId: string
  seasonId: string
  episode?: AdminEpisode
  defaultNumber?: number
  onDone: () => void
}) {
  const [state, action] = useActionState(async (prev: Parameters<typeof saveEpisode>[0], fd: FormData) => {
    const res = await saveEpisode(prev, fd)
    if (res?.success) onDone()
    return res
  }, null)
  useActionToast(state)
  const [videoId, setVideoId] = useState(episode?.videoId ?? "")
  const [duration, setDuration] = useState(String(episode?.durationSeconds ?? 0))
  const [thumb, setThumb] = useState(episode?.thumbnailUrl ?? "")
  const [looking, startLookup] = useTransition()

  return (
    <form action={action} className="grid gap-3 rounded-2xl bg-surface-2 p-4 md:grid-cols-6">
      {episode && <input type="hidden" name="id" value={episode.id} />}
      <input type="hidden" name="seasonId" value={seasonId} />
      <input type="hidden" name="contentId" value={contentId} />
      <Field label="Nº" htmlFor={`ep-n-${episode?.id ?? "new"}`}>
        <input id={`ep-n-${episode?.id ?? "new"}`} name="number" type="number" min={1} defaultValue={episode?.number ?? defaultNumber} className={inputClass} />
      </Field>
      <Field label="Título" htmlFor={`ep-t-${episode?.id ?? "new"}`} className="md:col-span-5">
        <input id={`ep-t-${episode?.id ?? "new"}`} name="title" required defaultValue={episode?.title} className={inputClass} />
      </Field>
      <Field label="Descrição" htmlFor={`ep-d-${episode?.id ?? "new"}`} className="md:col-span-6">
        <textarea id={`ep-d-${episode?.id ?? "new"}`} name="description" defaultValue={episode?.description} className={textareaClass} />
      </Field>
      <Field label="ID do vídeo (Bunny)" htmlFor={`ep-v-${episode?.id ?? "new"}`} className="md:col-span-3">
        <div className="flex gap-2">
          <input id={`ep-v-${episode?.id ?? "new"}`} name="videoId" value={videoId} onChange={(e) => setVideoId(e.target.value)} className={inputClass} />
          <Button
            type="button"
            variant="outline"
            disabled={!videoId || looking}
            title="Buscar duração e thumbnail no Bunny"
            onClick={() =>
              startLookup(async () => {
                const res = await lookupBunnyVideo(videoId)
                if ("error" in res && res.error) return void toast.error(res.error)
                if ("video" in res && res.video) {
                  setDuration(String(Math.round(res.video.durationSeconds)))
                  setThumb(res.video.thumbnailUrl)
                  toast.success("Dados do vídeo carregados")
                }
              })
            }
          >
            <Search />
          </Button>
        </div>
      </Field>
      <Field label="Duração (segundos)" htmlFor={`ep-s-${episode?.id ?? "new"}`} className="md:col-span-3">
        <input id={`ep-s-${episode?.id ?? "new"}`} name="durationSeconds" type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} className={inputClass} />
      </Field>
      <Field label="Thumbnail" htmlFor={`ep-i-${episode?.id ?? "new"}`} hint="Vazio = usa a thumbnail da série." className="md:col-span-6">
        <UploadField key={thumb} id={`ep-i-${episode?.id ?? "new"}`} name="thumbnailUrl" bucket="images" accept="image/*" defaultValue={thumb} />
      </Field>
      <div className="flex justify-end gap-2 md:col-span-6">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancelar
        </Button>
        <SubmitButton>{episode ? "Salvar episódio" : "Adicionar episódio"}</SubmitButton>
      </div>
    </form>
  )
}
