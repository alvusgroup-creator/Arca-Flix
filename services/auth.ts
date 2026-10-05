import "server-only"
import { cache } from "react"
import { redirect } from "next/navigation"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { DEMO_USER_ID, demoStore } from "@/lib/demo/store"
import type { Account } from "@/types"

/** Conta autenticada no pedido atual (memoizada por pedido). */
export const getCurrentAccount = cache(async (): Promise<Account | null> => {
  if (isDemoMode) {
    const session = await demoStore.getSession()
    if (!session) return null
    // No modo demonstração a conta tem acesso ao admin para facilitar a avaliação.
    return { id: DEMO_USER_ID, email: session.email, fullName: session.name, role: "admin" }
  }

  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) return null

  const { data: row } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", data.user.id)
    .maybeSingle()

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    fullName: row?.full_name ?? (data.user.user_metadata?.full_name as string | undefined) ?? "",
    role: row?.role === "admin" ? "admin" : "user",
  }
})

export async function requireAccount() {
  const account = await getCurrentAccount()
  if (!account) redirect("/login")
  return account
}

export async function requireAdmin() {
  const account = await requireAccount()
  if (account.role !== "admin") redirect("/browse")
  return account
}
