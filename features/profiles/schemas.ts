import { z } from "zod"
import { AVATARS } from "./avatars"

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Dê um nome ao perfil.").max(30, "Use no máximo 30 caracteres."),
  avatar: z.enum(AVATARS.map((a) => a.id) as [string, ...string[]]),
  kind: z.enum(["kids", "teen", "adult"]),
})

export const parentalSchema = z.object({
  maxAgeRating: z.enum(["L", "10", "12", "14", "16", "18"]),
  blockedCategoryIds: z.array(z.string()).max(50),
  /** "" = remover PIN; undefined = manter */
  pin: z
    .string()
    .regex(/^(\d{4})?$/, "O PIN deve ter 4 números.")
    .optional(),
})

export type ProfileFormValues = z.infer<typeof profileSchema>
export type ParentalFormValues = z.infer<typeof parentalSchema>
