import React, { useEffect, useState } from 'react';
import Cloud from '../components/FlashCardReading/cloud';
import Orb from '../components/FlashCardReading/orb';
import { DndContext } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import Score from '../components/FlashCardReading/score';
import backbutton from '../assets/backbutton.svg';

type CloudData = {
  id: string;
  text: string;
  x: number;
  y: number;
};

export default function CardGame1() {
  const texts = ['One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  const [clouds, setClouds] = useState<CloudData[]>([]);
  const [effectType, setEffectType] = useState<'sakura' | 'thunder' | null>(null);
  const [orbTint, setOrbTint] = useState<'green' | 'red' | null>(null);
  const [lives, setLives] = useState(3);
  const correctId = 'cloud-2'; // "Three" is correct

  const generateClouds = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const a = w * 0.35;
    const b = h * 0.25;
    const dev = Math.min(w, h) * 0.03;

    const generated: CloudData[] = [];
    for (let i = 0; i < 6; i++) {
      const θ = (2 * Math.PI * i) / 6;
      const baseX = a * Math.cos(θ);
      const baseY = b * Math.sin(θ);
      const jx = (Math.random() - 0.5) * 2 * dev;
      const jy = (Math.random() - 0.5) * 2 * dev;
      generated.push({
        id: `cloud-${i}`,
        text: texts[i],
        x: cx + baseX + jx,
        y: cy + baseY + jy,
      });
    }
    setClouds(generated);
  };

  useEffect(() => {
    generateClouds();
    window.addEventListener('resize', generateClouds);
    return () => window.removeEventListener('resize', generateClouds);
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over?.id === 'orb') {
      const isCorrect = active.id === correctId;
      setEffectType(isCorrect ? 'sakura' : 'thunder');
      setOrbTint(isCorrect ? 'green' : 'red');

      if (!isCorrect) {
        setLives(prev => Math.max(prev - 1, 0));
        setClouds(prev => prev.filter(cloud => cloud.id !== active.id)); // ❌ only delete that cloud
      }

      setTimeout(() => {
        setEffectType(null);
        setOrbTint(null);
      }, 3000);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#80E2DD] via-white to-[#45CFFB]">
        <div className="shadow-xl rounded-lg p-4 relative z-20 h-[10%]">
          <div className="flex justify-between pr-3">
            <img src={backbutton} alt="Back" className="w-10 h-10 cursor-pointer" onClick={() => window.history.back()} />
            <Score />
          </div>
        </div>

        {/* Lives display */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-40 text-lg font-bold text-red-500">
          Lives: {[...Array(lives)].map((_, i) => <span key={i}>❤️</span>)}
        </div>

        {/* Thunder Flash */}
        {effectType === 'thunder' && (
          <motion.div
            className="absolute inset-0 bg-white z-40 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.6, 0] }}
            transition={{ duration: 1.5 }}
          />
        )}

        {/* Thunder Bolts */}
        {effectType === 'thunder' &&
          [...Array(6)].map((_, i) => (
            <motion.div
              key={`bolt-${i}`}
              className="absolute z-50 text-yellow-400 text-[100px] select-none pointer-events-none drop-shadow-[0_0_20px_rgba(255,255,0,0.7)]"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${Math.random() * 50}%`,
                rotate: `${Math.random() * 30 - 15}deg`,
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 0], scale: [1, 1.4, 1] }}
              transition={{
                delay: i * 0.1,
                duration: 1.5,
                ease: 'easeInOut',
              }}
            >
              ⚡
            </motion.div>
          ))}

        {/* Sakura Petals */}
        {effectType === 'sakura' &&
          [...Array(80)].map((_, i) => {
            const delay = Math.random() * 0.8;
            const duration = 6 + Math.random() * 3;
            const startLeft = Math.random() * 100;
            const driftX = 40 + Math.random() * 80;
            const size = 16 + Math.random() * 10;

            return (
              <motion.div
                key={`sakura-${i}`}
                className="fixed z-50 pointer-events-none select-none"
                style={{
                  left: `${startLeft}%`,
                  top: '-10%',
                  fontSize: `${size}px`,
                }}
                animate={{
                  y: '150vh',
                  x: `-${driftX}px`,
                  rotate: [0, 180, 360],
                  opacity: [1, 1, 0.8, 0.5],
                }}
                transition={{
                  duration,
                  delay,
                  ease: 'easeInOut',
                }}
              >
                🌸
              </motion.div>
            );
          })}

        {/* Clouds */}
        {clouds.map((c) => (
          <div
            key={c.id}
            className="absolute"
            style={{
              left: c.x,
              top: c.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 10,
            }}
          >
            <Cloud id={c.id} text={c.text} />
          </div>
        ))}

        {/* Orb */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30">
          <div className="relative">
            {orbTint && (
              <motion.div
                className={`absolute w-full h-full rounded-full blur-3xl ${
                  orbTint === 'green' ? 'bg-green-400/50' : 'bg-red-400/50'
                }`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.7, 0.9, 0] }}
                transition={{ duration: 2 }}
              />
            )}
            <Orb />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
