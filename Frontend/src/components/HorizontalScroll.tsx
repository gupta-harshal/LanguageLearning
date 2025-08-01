import { useRef } from "react"

export default function HorizontalScroll({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const scrollDiv = useRef<HTMLDivElement>(null)
  return (
    <div
      ref={scrollDiv}
      className=" scrollbar-hidden-scrollbar overflow-x-auto w-full py-4 snap-x snap-mandatory"
    >
      <div className={`flex gap-2 w-max ${className}`}>{children}</div>
    </div>
  )
}
