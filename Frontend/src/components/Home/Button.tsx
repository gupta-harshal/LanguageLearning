import { useEffect, useState } from "react"

interface Input {
  children: React.ReactNode
  className: string
}

export default function Button({ children, className }: Input) {

    const [showClick, setShowClick] = useState<boolean>(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowClick(false)
        }, 500)
        return () => clearTimeout(timer)
    }, [showClick])

  return (
    <button
      className={`
        text-white w-72 h-12 
        font-anglo-japanese text-3xl rounded-lg 
        hover:translate-x-[8px] hover:translate-y-[6px] hover:shadow-[0px_0px_0]  ease-in duration-150 shadow-[8px_6px_0]
        text-shadow-[1px_1px_1px] text-shadow-black hover:text-shadow-[0px_0px_0px]
        ${className} ${showClick && " hover:border-[6px] border-white "}`}
        onClick={() => {setShowClick(true)}}
    >
      {children}
    </button>
  )
}
