import type { AgeRating, ProfileKind } from "@/types"

export const AGE_RATINGS: AgeRating[] = ["L", "10", "12", "14", "16", "18"]

export const ageRatingLabel: Record<AgeRating, string> = {
  L: "Livre",
  "10": "10 anos",
  "12": "12 anos",
  "14": "14 anos",
  "16": "16 anos",
  "18": "18 anos",
}

export function isRatingAllowed(rating: AgeRating, max: AgeRating) {
  return AGE_RATINGS.indexOf(rating) <= AGE_RATINGS.indexOf(max)
}

export const defaultMaxRating: Record<ProfileKind, AgeRating> = {
  kids: "10",
  teen: "14",
  adult: "18",
}

export const profileKindLabel: Record<ProfileKind, string> = {
  kids: "Infantil",
  teen: "Adolescente",
  adult: "Adulto",
}
