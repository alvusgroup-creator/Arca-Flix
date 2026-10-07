"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"

/**
 * Fundo do hero: vídeo em loop (sem som) com capa por baixo.
 * Cai para a imagem quando o usuário pede menos movimento ou economia de dados.
 */
export function HeroMedia({
  poster,
  posterMobile,
  video,
  videoMobile,
}: {
  poster: string
  posterMobile: string | null
  video: string | null
  videoMobile: string | null
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const [allowVideo, setAllowVideo] = useState(false)

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData
    // eslint-disable-next-line react-hooks/set-state-in-effect -- decisão depende de APIs do navegador
    setAllowVideo(Boolean(video) && !reduced && !saveData)
  }, [video])

  return (
    <>
      <Image
        src={poster}
        alt=""
        fill
        preload
        sizes="100vw"
        className={`-z-20 object-cover object-[60%_center] ${posterMobile ? "max-md:hidden" : ""}`}
      />
      {posterMobile && (
        <Image src={posterMobile} alt="" fill preload sizes="100vw" className="-z-20 object-cover object-top md:hidden" />
      )}
      {allowVideo && video && (
        <video
          ref={ref}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
          aria-hidden="true"
          onPlaying={() => setPlaying(true)}
          className={`absolute inset-0 -z-20 size-full object-cover object-[60%_center] transition-opacity duration-700 ${playing ? "opacity-100" : "opacity-0"}`}
        >
          {videoMobile && <source src={videoMobile} type="video/mp4" media="(max-width: 767px)" />}
          <source src={video} type="video/mp4" />
        </video>
      )}
    </>
  )
}
