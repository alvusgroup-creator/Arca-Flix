"use client"

// Último recurso: substitui o layout raiz, por isso usa estilos inline.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, minHeight: "100dvh", display: "grid", placeItems: "center", background: "#0e0a1a", color: "#f6f2ff", fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24 }}>
        <div>
          <h1 style={{ fontSize: 28 }}>Algo não saiu como esperado</h1>
          <p style={{ opacity: 0.7 }}>Recarregue a página para continuar.</p>
          <button onClick={() => retry()} style={{ marginTop: 16, padding: "12px 24px", borderRadius: 999, border: 0, background: "#7b2fbe", color: "#fff", fontWeight: 700, cursor: "pointer" }}>
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
