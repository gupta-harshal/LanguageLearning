import { useRecoilValue } from "recoil"
import { score } from "../../atoms/flashcardreading/score"

export default function Score() {
  const value = useRecoilValue(score)
  return (
    <div className="relative z-10 font-anglo-japanese text-white text-lg sm:text-2xl font-semibold whitespace-nowrap">
      {value}
      <span className="ml-1 text-xs sm:text-sm font-sans opacity-80">pts</span>
    </div>
  )
}
