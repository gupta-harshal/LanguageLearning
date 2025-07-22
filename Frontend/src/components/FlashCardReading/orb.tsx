import { motion } from 'framer-motion';
import Droppable from '../../utils/FlashCardReading/drop';
import { useRecoilValue } from 'recoil';
import { readingWord } from '../../atoms/flashcardreading/word';

export default function Orb() {
  const word = useRecoilValue(readingWord);

  return (
    <Droppable id="orb">
      <div className="relative w-96 h-96 flex items-center justify-center overflow-hidden">
        {/* Misty background blobs */}
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-full h-full bg-purple-700/30 blur-3xl"
            style={{
              clipPath:
                'polygon(30% 20%, 70% 10%, 90% 50%, 60% 90%, 20% 80%, 10% 50%)',
              zIndex: i,
            }}
            animate={{
              x: [0, 20, -20, 0],
              y: [0, -15, 15, 0],
              rotate: [0, 10, -10, 0],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Word text */}
        <motion.div
          className="z-20 font-anglo-japan text-white text-3xl drop-shadow-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          {word}
        </motion.div>

        {/* Glowing center mist */}
        <motion.div
          className="absolute w-40 h-40 bg-purple-500/40 blur-[100px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </div>
    </Droppable>
  );
}
