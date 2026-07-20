import React, { useEffect, useState } from 'react';
import asteroidImg from '../../assets/asteroid.png';

interface AsteroidProps {
  id: string;
  text: string;
  startLeft: number;
  onFallComplete: (id: string) => void;
  stageHeight: number;
  fallSpeed?: number; // optional: seconds it takes to fall
}

const Asteroid = ({
  id,
  text,
  startLeft,
  onFallComplete,
  stageHeight,
  fallSpeed = 15,
}: AsteroidProps) => {
  const [isFalling, setIsFalling] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsFalling(true);
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  const handleTransitionEnd = () => {
    onFallComplete(id);
  };

  return (
    <div
      onTransitionEnd={handleTransitionEnd}
      className="pointer-events-none absolute z-20 h-24 w-24 transition-[top] ease-linear"
      style={{
        top: isFalling ? stageHeight - 150 : -100,
        left: `${startLeft}px`,
        transition: `top ${fallSpeed}s linear`,
      }}
    >
      <img
        src={asteroidImg}
        alt="asteroid"
        className="h-full w-full animate-spin object-contain [animation-duration:10s] [filter:drop-shadow(0_0_12px_rgba(255,201,145,0.4))]"
      />

      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[15px] font-bold text-amber-50 [text-shadow:0_2px_8px_rgba(8,12,24,0.9)]">
        {text}
      </div>
    </div>
  );
};

export default React.memo(Asteroid);
