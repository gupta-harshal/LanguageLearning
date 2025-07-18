import React, { useEffect, useState } from 'react';
import Asteroid from '../components/AsteroidShooter/asteroid';
import Laser from '../components/AsteroidShooter/laser';

const GameCanvas = () => {
  const [asteroids, setAsteroids] = useState([
    { id: 'a1', text: 'くも' }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = 'a' + Date.now();
      const japaneseWords = ['くも', 'そら', 'ほし', 'つき', 'やま'];
      const text = japaneseWords[Math.floor(Math.random() * japaneseWords.length)];
      setAsteroids((prev) => [...prev, { id, text }]);
    }, 2000); // spawn every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const destroyAsteroid = (id: string) => {
    setAsteroids((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {asteroids.map((ast) => (
        <Asteroid key={ast.id} id={ast.id} text={ast.text} onDestroy={destroyAsteroid} />
      ))}
      <Laser positionX={window.innerWidth / 2 - 4} />
    </div>
  );
};

export default GameCanvas;
