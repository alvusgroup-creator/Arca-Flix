"use client"

import Link from "next/link"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { formatDate } from "@/utils/format"
import type { NotificationItem } from "@/types"

export function NotificationsMenu({ notifications }: { notifications: NotificationItem[] }) {
  const unread = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={unread ? `Notificações (${unread} não lidas)` : "Notificações"}
        className="relative grid size-10 place-items-center rounded-full text-foreground/85 outline-none hover:bg-grape-600/10 focus-visible:ring-2 focus-visible:ring-lilac-400"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute top-2 right-2 size-2 rounded-full bg-grape-500 ring-2 ring-surface-0" aria-hidden="true" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-80 p-2">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-foreground">Notificações</DropdownMenuLabel>
          {notifications.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">Nenhuma notificação por enquanto.</p>
          )}
          {notifications.map((n) => (
            <DropdownMenuItem
              key={n.id}
              render={<Link href={n.href ?? "#"} />}
              className="flex flex-col items-start gap-0.5 rounded-lg px-2 py-2.5"
            >
              <span className="flex w-full items-center gap-2 text-sm font-medium">
                <span className={cn("size-1.5 shrink-0 rounded-full", n.read ? "bg-transparent" : "bg-grape-500")} />
                {n.title}
              </span>
              <span className="pl-3.5 text-xs text-muted-foreground">{n.body}</span>
              <span className="pl-3.5 text-[0.7rem] text-foreground/35">{formatDate(n.createdAt)}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
