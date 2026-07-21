import { motion } from "framer-motion"
import Droppable from "../../utils/FlashCardReading/drop"
import { useRecoilValue } from "recoil"
import { readingWord } from "../../atoms/flashcardreading/word"

export default function Orb() {
  const word = useRecoilValue(readingWord)

  return (
    <Droppable id="orb">
      <div className="relative w-40 h-40 sm:w-56 sm:h-56 md:w-64 md:h-64 flex items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-[#9B6DFF] via-[#6B4EFF] to-[#3D2B8C] shadow-[0_0_40px_rgba(107,78,255,0.55)]"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-3 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="relative z-10 flex flex-col items-center gap-1"
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 2.8, repeat: Infinity }}
        >
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-white/70">
            Drop here
          </span>
          <span className="font-japanese text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg leading-none">
            {word}
          </span>
          <span className="text-[10px] sm:text-xs text-white/60 font-sans">san</span>
        </motion.div>
      </div>
    </Droppable>
  )
}
