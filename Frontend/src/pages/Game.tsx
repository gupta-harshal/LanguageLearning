import React, { useEffect, useState } from 'react';
import Asteroid from '../components/AsteroidShooter/asteroid';
import EngToJap from '../components/engtoJap';

interface AsteroidType {
  id: string;
  text: string;
  startX: number;
  startY: number;
  angleToTarget: number;
}

const GameCanvas = () => {
  const [asteroids, setAsteroids] = useState<AsteroidType[]>([]);
  const [stars, setStars] = useState<{ x: number; y: number; speed: number }[]>([]);

  // Starfield
  useEffect(() => {
    const generateStar = () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 0.3 + Math.random() * 0.7,
    });

    setStars(Array.from({ length: 100 }, generateStar));

    const interval = setInterval(() => {
      setStars(prev =>
        prev.map(star => ({
          ...star,
          y: star.y > window.innerHeight ? 0 : star.y + star.speed,
        }))
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const spawnAsteroid = () => {
    const id = 'a' + Date.now();
    const japaneseWords = ['くも', 'そら', 'ほし', 'つき', 'やま'];
    const text = japaneseWords[Math.floor(Math.random() * japaneseWords.length)];

    let startX = 0, startY = 0;
    const edge = Math.floor(Math.random() * 4);

    if (edge === 0) {
      startX = Math.random() * window.innerWidth;
      startY = -50;
    } else if (edge === 1) {
      startX = Math.random() * window.innerWidth;
      startY = window.innerHeight + 50;
    } else if (edge === 2) {
      startX = -50;
      startY = Math.random() * window.innerHeight;
    } else {
      startX = window.innerWidth + 50;
      startY = Math.random() * window.innerHeight;
    }

    // Center of EngToJap zone
    const targetX = window.innerWidth * 0.3 + window.innerWidth * 0.2;
    const targetY = window.innerHeight - 50;
    const angle = Math.atan2(targetY - startY, targetX - startX);

    setAsteroids(prev => [...prev, { id, text, startX, startY, angleToTarget: angle }]);
  };

  useEffect(() => {
    const interval = setInterval(spawnAsteroid, 2000);
    return () => clearInterval(interval);
  }, []);

  const destroyAsteroid = (id: string) => {
    setAsteroids(prev => prev.filter(a => a.id !== id));
  };

  const handleEnter = (input: string) => {
    const match = asteroids.find(a => a.text === input);
    if (match) {
      destroyAsteroid(match.id);
    }
  };

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: 'black', position: 'relative' }}
    >
      {/* Starfield */}
      {stars.map((star, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: star.y,
            left: star.x,
            width: '2px',
            height: '2px',
            backgroundColor: 'white',
            opacity: 0.7,
          }}
        />
      ))}

      {/* Asteroids */}
      {asteroids.map(ast => (
        <Asteroid
          key={ast.id}
          id={ast.id}
          text={ast.text}
          startX={ast.startX}
          startY={ast.startY}
          angleToTarget={ast.angleToTarget}
          onDestroy={destroyAsteroid}
          targetX={window.innerWidth * 0.3}
          targetWidth={window.innerWidth * 0.4}
        />
      ))}

      {/* "Spaceship" input box */}
      <EngToJap
        className="absolute bottom-[2%] left-[30%] w-[40%] p-3 text-white text-lg bg-gray-800 border border-white rounded-md text-center"
        onEnter={handleEnter}
      />
    </div>
  );
};

export default GameCanvas;
