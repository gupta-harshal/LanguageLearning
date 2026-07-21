import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface Input {
  children: React.ReactNode
  className: string
  to?: string
  onClick?: () => void
}

export default function Button({ children, className, to, onClick }: Input) {
  const navigate = useNavigate()
  const [showClick, setShowClick] = useState(false)

  useEffect(() => {
    if (!showClick) return
    const timer = setTimeout(() => setShowClick(false), 500)
    return () => clearTimeout(timer)
  }, [showClick])

  return (
    <button
      type="button"
      className={`
        text-white w-full max-w-72 min-h-12 px-6 py-3
        font-anglo-japanese text-xl sm:text-2xl rounded-lg
        hover:translate-x-[8px] hover:translate-y-[6px] hover:shadow-[0px_0px_0]
        ease-in duration-150 shadow-[8px_6px_0]
        text-shadow-[1px_1px_1px] text-shadow-black hover:text-shadow-[0px_0px_0px]
        ${className} ${showClick ? "border-[6px] border-white" : ""}`}
      onClick={() => {
        setShowClick(true)
        onClick?.()
        if (to) navigate(to)
      }}
    >
      {children}
    </button>
  )
}
