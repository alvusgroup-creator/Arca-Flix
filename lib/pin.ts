import "server-only"
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

// PIN de perfil (4 dígitos). Guardado como "salt:hash" — nunca em texto puro.

export function hashPin(pin: string) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(pin, salt, 32).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPin(pin: string, stored: string | null) {
  if (!stored) return true
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const candidate = scryptSync(pin, salt, 32)
  const expected = Buffer.from(hash, "hex")
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}
