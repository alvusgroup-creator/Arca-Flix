import "server-only"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/server"
import { demoNotifications } from "@/lib/demo/data"
import type { NotificationItem } from "@/types"

export async function getNotifications(): Promise<NotificationItem[]> {
  if (isDemoMode) return demoNotifications

  const supabase = await createClient()
  const { data } = await supabase
    .from("notifications")
    .select("id, title, body, href, read_at, created_at")
    .order("created_at", { ascending: false })
    .limit(20)
  return (data ?? []).map((n) => ({
    id: n.id,
    title: n.title,
    body: n.body,
    href: n.href,
    read: Boolean(n.read_at),
    createdAt: n.created_at,
  }))
}
