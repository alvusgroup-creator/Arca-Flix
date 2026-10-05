"use client"

import { useTransition } from "react"
import { MonitorSmartphone, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/utils/format"
import type { Device } from "@/types"
import { signOutDevice } from "../actions"

export function DeviceList({ devices, maxDevices }: { devices: Device[]; maxDevices: number | null }) {
  const [pending, startTransition] = useTransition()
  return (
    <>
      <ul className="divide-y divide-grape-600/[0.06] overflow-hidden rounded-3xl border border-grape-600/[0.07] bg-surface-1">
        {devices.map((d) => (
          <li key={d.id} className="flex items-center gap-4 p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-grape-600/5 text-lilac-400">
              <MonitorSmartphone className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">
                {d.name}
                {d.current && <span className="ml-2 rounded-full bg-grape-600/30 px-2 py-0.5 text-[0.7rem] font-semibold">Este aparelho</span>}
              </p>
              <p className="text-sm text-muted-foreground">Último acesso: {formatDate(d.lastSeenAt)}</p>
            </div>
            {!d.current && (
              <Button
                variant="ghost"
                size="icon"
                disabled={pending}
                aria-label={`Remover ${d.name}`}
                onClick={() =>
                  startTransition(async () => {
                    const res = await signOutDevice(d.id)
                    if (res.success) toast.success(res.success)
                  })
                }
              >
                <X />
              </Button>
            )}
          </li>
        ))}
      </ul>
      {maxDevices && (
        <p className="mt-4 text-sm text-muted-foreground">O seu plano permite assistir em até {maxDevices} telas ao mesmo tempo.</p>
      )}
    </>
  )
}
