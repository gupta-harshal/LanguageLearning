import { useRef } from "react"

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
  return (
    <div>
      {Array.from({ length: days.current[month - 1] }, (_, i) => (
        <span key={i}>{i + 1} </span>
      ))}
    </div>
  )
}
