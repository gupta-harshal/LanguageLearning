import React, { useEffect, useState } from 'react';
import asteroidImg from '../../assets/asteroid.png';

interface AsteroidProps {
  id: string;
  text: string;
  onDestroy: (id: string) => void;
}

const Asteroid = ({ id, text, onDestroy }: AsteroidProps) => {
  const [startLeft, setStartLeft] = useState(0);
  const [fallDuration, setFallDuration] = useState(0);

  useEffect(() => {
    const left = Math.random() * (window.innerWidth - 100);
    const duration = 10 + Math.random() * 4; // seconds
    setStartLeft(left);
    setFallDuration(duration);
  }, []);

  const handleAnimationEnd = () => {
    onDestroy(id);
  };

  return (
    <div
      onAnimationEnd={handleAnimationEnd}
      style={{
        position: 'absolute',
        top: '-100px',
        left: `${startLeft}px`,
        width: '96px',
        height: '96px',
        zIndex: 10,
        animation: `fall ${fallDuration}s linear forwards`,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          animation: 'spin 12s linear infinite',
        }}
      >
        <img
          src={asteroidImg}
          alt="asteroid"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(0deg)',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '14px',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>

      <style>
        {`
          @keyframes fall {
            from {
              top: -100px;
            }
            to {
              top: ${window.innerHeight + 100}px;
            }

          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default Asteroid;
