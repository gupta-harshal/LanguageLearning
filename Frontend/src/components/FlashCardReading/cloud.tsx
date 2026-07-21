import Draggable from "../../utils/FlashCardReading/drag"

interface CloudProps {
  id: string
  text: string
  className?: string
}

function CloudVisual({ text, className = "" }: Omit<CloudProps, "id">) {
  return (
    <div
      className={`relative flex items-center justify-center h-[68px] sm:h-[84px] min-w-[118px] sm:min-w-[150px] px-5 sm:px-6 touch-none ${className}`}
    >
      <div className="absolute inset-0 rounded-[999px] bg-[#F4FBFF] shadow-[0_10px_24px_rgba(20,80,95,0.28)] border-2 border-[#7EB8C8]/70" />
      <div className="absolute -top-3 left-5 h-10 w-10 rounded-full bg-[#F4FBFF] border border-[#7EB8C8]/40" />
      <div className="absolute -top-5 left-12 h-12 w-12 rounded-full bg-[#F4FBFF] border border-[#7EB8C8]/40" />
      <div className="absolute -top-3 right-6 h-9 w-9 rounded-full bg-[#F4FBFF] border border-[#7EB8C8]/40" />
      <div className="relative z-10 font-anglo-japanese text-[#12343f] text-base sm:text-xl font-semibold whitespace-nowrap drop-shadow-sm">
        {text}
      </div>
    </div>
  )
}

export default function Cloud({ id, text, className }: CloudProps) {
  return (
    <Draggable id={id}>
      <CloudVisual text={text} className={className} />
    </Draggable>
  )
}
