import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-transparent text-sm font-bold whitespace-nowrap transition-[background-color,color,border-color,transform,box-shadow] duration-200 outline-none select-none focus-visible:ring-3 focus-visible:ring-lilac-400/50 active:not-aria-[haspopup]:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-grape-600 text-white hover:bg-grape-700",
        light: "bg-white text-grape-700 hover:bg-cloud",
        // Sobre fotos com véu escuro
        onDark: "border-white/35 bg-white/10 text-white backdrop-blur-sm hover:border-white/60 hover:bg-white/20",
        lilac: "bg-lilac-100 text-grape-700 hover:bg-lilac-200",
        outline:
          "border-grape-900/15 bg-white text-grape-900 hover:border-grape-500/60 hover:bg-lilac-100",
        secondary: "bg-lilac-100 text-grape-700 hover:bg-lilac-200",
        ghost: "text-foreground/80 hover:bg-grape-600/8 hover:text-grape-700",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25",
        link: "text-lilac-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5",
        xs: "h-7 px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",
        sm: "h-9 px-3.5 text-[0.85rem]",
        lg: "h-12 px-7 text-[0.95rem] [&_svg:not([class*='size-'])]:size-5",
        icon: "size-10",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-9",
        "icon-lg": "size-12 [&_svg:not([class*='size-'])]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
