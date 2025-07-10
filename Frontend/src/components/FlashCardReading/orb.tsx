import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface OrbProps {
  text: string;
  effectType?: 'sakura' | 'thunder' | null;
}

export default function Orb({ text, effectType = null }: OrbProps) {
  const [showEffect, setShowEffect] = useState(false);

  useEffect(() => {
    if (effectType) {
      setShowEffect(true);
      const timeout = setTimeout(() => setShowEffect(false), 1500);
      return () => clearTimeout(timeout);
    }
  }, [effectType]);

  return (
    <div className="relative w-96 h-96 flex items-center justify-center overflow-hidden">
      {/* Misty floating shapes */}
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

      {/* Glowing central word */}
      <motion.div
        className="z-20 text-white text-3xl font-bold drop-shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {text}
      </motion.div>

      {/* Glowing center mist */}
      <motion.div
        className="absolute w-40 h-40 bg-purple-500/40 blur-[100px] rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      {/* 🌸 Cherry Blossom Effect */}
      {showEffect && effectType === 'sakura' &&
        [...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-pink-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-10%',
              zIndex: 50,
            }}
            animate={{
              y: '110%',
              x: [0, Math.random() * 40 - 20],
              rotate: 360,
              opacity: [1, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              ease: 'easeInOut',
            }}
          />
        ))}

      {/* ⚡ Thunder Flash Effect */}
      {showEffect && effectType === 'thunder' && (
        <motion.div
          className="absolute inset-0 bg-white z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}
