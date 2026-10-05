import Image from "next/image"
import { Lock, Pencil } from "lucide-react"
import { cn } from "@/lib/utils"
import { profileKindLabel } from "@/utils/age-rating"
import type { ViewerProfile } from "@/types"
import { avatarSrc } from "../avatars"

export function ProfileCard({
  profile,
  editing = false,
  onClick,
  disabled,
}: {
  profile: ViewerProfile
  editing?: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={editing ? `Editar perfil ${profile.name}` : `Assistir como ${profile.name}`}
      className="group/profile flex w-full flex-col items-center gap-3 rounded-3xl p-2 outline-none disabled:opacity-60"
    >
      <span
        className={cn(
          "relative block aspect-square w-full overflow-hidden rounded-2xl ring-2 ring-transparent transition-all duration-300 ease-(--ease-soft)",
          "group-hover/profile:-translate-y-1 group-hover/profile:ring-lilac-400 group-focus-visible/profile:ring-lilac-400",
          "shadow-[0_16px_40px_-20px_rgb(91_33_182/0.35)]"
        )}
      >
        <Image src={avatarSrc(profile.avatar)} alt="" fill sizes="(min-width: 768px) 160px, 40vw" className="object-cover" />
        {editing && (
          <span className="absolute inset-0 grid place-items-center bg-grape-900/50">
            <Pencil className="size-8 text-white" aria-hidden="true" />
          </span>
        )}
        {profile.hasPin && !editing && (
          <span className="absolute right-2 bottom-2 grid size-7 place-items-center rounded-full bg-white/90 text-grape-600" title="Protegido por PIN">
            <Lock className="size-3.5" aria-hidden="true" />
          </span>
        )}
      </span>
      <span className="space-y-0.5 text-center">
        <span className="block text-base font-semibold text-foreground/90 transition-colors group-hover/profile:text-foreground md:text-lg">
          {profile.name}
        </span>
        <span className="block text-xs text-foreground/45">{profileKindLabel[profile.kind]}</span>
      </span>
    </button>
  )
}
