import { cn } from "@/lib/utils"

/** Destaca uma expressão com um traço curvo desenhado ao aparecer. */
export function Highlight({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("relative inline-block whitespace-nowrap", className)}>
      <span className="relative z-10">{children}</span>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        className="absolute -bottom-1.5 left-0 h-3 w-full text-sun-400 sm:-bottom-2 sm:h-3.5"
      >
        <path
          d="M3 9.5C42 3.5 104 1.5 197 6.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          className="[animation:draw_900ms_400ms_var(--ease-soft)_both] motion-reduce:animate-none"
        />
      </svg>
    </span>
  )
}
