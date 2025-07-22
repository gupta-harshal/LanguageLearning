import { useEffect, useRef, useState } from "react"

export default function Calendar({
  month,
  year,
}: {
  month: number
  year: number
}) {
  const days = useRef<number[]>([
    31,
    28 + Number(year % 4 == 0 && year % 100 != 0),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ])
  const [offset, setOffset] = useState<number>(0)
  useEffect(() => {
    setOffset(new Date(year, month).getDay())
  }, [month, year])

  return (
    <div className={`grid gap-4 h-fit`}>
      <div className=" grid grid-cols-7 gap-4 w-full">
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          S
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          M
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          T
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          W
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          T
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          F
        </span>
        <span className="rounded-md align-middle flex items-center justify-center font-semibold text-shadow-[1px_1px_0] text-shadow-secondary-font-color text-white">
          S
        </span>
      </div>

      {Array.from({ length: Math.ceil((days.current[month] + offset) / 7) }, (_, i) => {
        return (
          <div key={i} className=" grid grid-cols-7 gap-4 w-full">
            {Array.from({ length: 7 }, (_, j) => {
              const dayNumber = i * 7 + j + 1 - offset
              if (dayNumber <= days.current[month] && dayNumber > 0) {
                return (
                  <span
                    key={dayNumber}
                    className="bg-green-secondary rounded-md align-middle flex items-center justify-center shadow-[2px_2px_0] 
                        shadow-pink-tertiary hover:shadow-[0px_0px_0] duration-150 hover:translate-x-0.5 hover:translate-y-[2px] cursor-pointer"
                  >
                    {dayNumber}
                  </span>
                )
              } else if (dayNumber <= 0) {
                return <span></span>
              } else {
                return null
              }
            })}
          </div>
        )
      })}
    </div>
  )
}
