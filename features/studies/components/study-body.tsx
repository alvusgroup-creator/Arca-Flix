import { Fragment } from "react"

/**
 * Renderizador mínimo do corpo dos estudos (subconjunto de Markdown):
 * "## título", "> citação", listas "- " e "1. ", parágrafos.
 * Não interpreta HTML — o texto é sempre escapado pelo React.
 */
export function StudyBody({ body }: { body: string }) {
  const blocks = body.trim().split(/\n{2,}/)

  return (
    <div className="space-y-5 text-[1.075rem] leading-[1.8] text-foreground/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n")
        if (block.startsWith("## ")) {
          return (
            <h2 key={i} className="pt-4 text-2xl font-semibold text-foreground">
              {block.slice(3)}
            </h2>
          )
        }
        if (lines.every((l) => l.startsWith("> "))) {
          return (
            <blockquote key={i} className="rounded-2xl border-l-4 border-lilac-400 bg-grape-600/10 px-5 py-4 font-medium text-foreground italic">
              {lines.map((l, j) => (
                <Fragment key={j}>
                  {j > 0 && <br />}
                  {l.slice(2)}
                </Fragment>
              ))}
            </blockquote>
          )
        }
        if (lines.every((l) => /^- /.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-2 pl-6 marker:text-lilac-400">
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          )
        }
        if (lines.every((l) => /^\d+\. /.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-2 pl-6 marker:font-bold marker:text-lilac-400">
              {lines.map((l, j) => (
                <li key={j}>{l.replace(/^\d+\. /, "")}</li>
              ))}
            </ol>
          )
        }
        return <p key={i}>{block}</p>
      })}
    </div>
  )
}
