export const AVATARS = [
  { id: "lion", label: "Leão" },
  { id: "lamb", label: "Ovelhinha" },
  { id: "giraffe", label: "Girafa" },
  { id: "dove", label: "Pomba" },
  { id: "parrot", label: "Arara" },
  { id: "puppy", label: "Cachorrinho" },
  { id: "zebra", label: "Zebra" },
  { id: "elephant", label: "Elefante" },
  { id: "deer", label: "Corça" },
  { id: "bird", label: "Passarinho" },
] as const

export type AvatarId = (typeof AVATARS)[number]["id"]

export const avatarSrc = (id: string) =>
  `/avatars/${AVATARS.some((a) => a.id === id) ? id : "lion"}.jpg`
