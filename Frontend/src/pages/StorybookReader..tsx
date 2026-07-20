import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import woodenImage from '../assets/wooden.png';
import scrollEnd from '../assets/scroll-end.svg';

export default function JapaneseScroll() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Add a slight delay for dramatic effect
    setTimeout(() => setOpen(true), 800);
  }, []);

  const paperWidthPercent = 75;
  const endHeight = 70;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start py-12 relative overflow-hidden"
      style={{ backgroundImage: `url(${woodenImage})` }}
    >
      {/* Ambient glowing dust/magic particles */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-100 via-transparent to-transparent"></div>

      <div
        className="relative flex flex-col items-center z-10 w-[90vw] md:w-[75vw] max-w-4xl"
      >
        {/* Top scroll end */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          style={{
            width: '100%',
            height: `${endHeight}px`,
            position: 'relative',
            zIndex: 3,
            filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.5))'
          }}
        >
          <img
            src={scrollEnd}
            alt="Scroll Top End"
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Scroll paper container */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: open ? '70vh' : 0 }}
          transition={{ duration: 2.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full bg-[#fdf5e6] border-x-[12px] border-[#8b4513] shadow-[inset_0_0_50px_rgba(139,69,19,0.2),0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden relative"
          style={{
            marginTop: '-15px',
            marginBottom: '-15px',
            zIndex: 2,
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/rice-paper.png")',
          }}
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1.5 }}
                className="p-10 md:p-16 h-full overflow-y-auto no-scrollbar relative flex flex-col items-center"
              >
                {/* Subtle vertical writing text in background */}
                <div className="absolute top-10 right-10 writing-mode-vertical text-6xl text-[#8b4513]/5 font-japanese select-none pointer-events-none">
                  桜の花の物語
                </div>
                
                <h1 className="font-anglo-japanese text-5xl md:text-6xl mb-10 text-center text-[#4a2e15] drop-shadow-md">
                  The Tale of the Blossoming Sakura
                </h1>
                
                <div className="text-xl md:text-2xl leading-relaxed text-[#3a2511] font-serif max-w-2xl text-center flex flex-col gap-6 space-y-4">
                  <p className="first-letter:text-6xl first-letter:font-anglo-japanese first-letter:float-left first-letter:mr-4 first-letter:text-[#8b4513]">
                    Once upon a time in ancient Japan, a paper scroll revealed stories of courage and beauty.
                  </p>
                  <p>
                    The wind carried the whispers of the samurai, and the cherry blossoms danced in the moonlight...
                  </p>
                  <div className="my-10 flex justify-center">
                    <button className="bg-gradient-to-r from-[#8b4513] to-[#a0522d] text-[#fdf5e6] px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                      Begin Reading
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Bottom scroll end */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, type: "spring" }}
          style={{
            width: '100%',
            height: `${endHeight}px`,
            position: 'relative',
            zIndex: 3,
            filter: 'drop-shadow(0 15px 15px rgba(0,0,0,0.5))'
          }}
        >
          <img
            src={scrollEnd}
            alt="Scroll Bottom End"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  );
}
