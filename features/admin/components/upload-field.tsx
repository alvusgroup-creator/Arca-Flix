"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { LoaderCircle, Upload } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { isDemoMode } from "@/lib/env"
import { createClient } from "@/lib/supabase/client"
import { createUploadUrl, type UploadBucket } from "../actions"
import { inputClass } from "./form-kit"

/**
 * Campo de mídia: aceita uma URL/caminho digitado ou envia o arquivo direto
 * para o Supabase Storage com URL assinada (sem passar pelo servidor da app).
 */
export function UploadField({
  id,
  name,
  bucket,
  accept,
  defaultValue,
  placeholder,
  preview = false,
  onUploaded,
}: {
  id: string
  name: string
  bucket: UploadBucket
  accept: string
  defaultValue?: string | null
  placeholder?: string
  preview?: boolean
  onUploaded?: (file: File) => void
}) {
  const [value, setValue] = useState(defaultValue ?? "")
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function upload(file: File) {
    setUploading(true)
    try {
      const res = await createUploadUrl(bucket, file.name)
      if ("error" in res && res.error) return void toast.error(res.error)
      if (!("token" in res) || !res.token) return
      const { error } = await createClient().storage.from(bucket).uploadToSignedUrl(res.path, res.token, file, {
        contentType: file.type || undefined,
      })
      if (error) return void toast.error("Falha no envio do arquivo.")
      setValue(res.value)
      onUploaded?.(file)
      toast.success("Arquivo enviado.")
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  const showPreview = preview && value && (value.startsWith("http") || value.startsWith("/"))

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          id={id}
          name={name}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder ?? "URL ou caminho do arquivo"}
          className={inputClass}
        />
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void upload(file)
          }}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || isDemoMode}
          title={isDemoMode ? "Disponível com o Supabase configurado" : "Enviar arquivo"}
          onClick={() => fileRef.current?.click()}
          className="shrink-0"
        >
          {uploading ? <LoaderCircle className="animate-spin" /> : <Upload />}
          <span className="max-sm:sr-only">Enviar</span>
        </Button>
      </div>
      {showPreview && (
        <div className="relative aspect-video w-48 overflow-hidden rounded-2xl bg-surface-2">
          <Image src={value} alt="Pré-visualização" fill sizes="192px" className="object-cover" unoptimized={value.startsWith("http")} />
        </div>
      )}
    </div>
  )
}
