import React, { useEffect, useState } from 'react';

interface LaserProps {
  positionX: number;
}

const Laser = ({ positionX }: LaserProps) => {
  const [positionY, setPositionY] = useState(window.innerHeight - 80);

  useEffect(() => {
    let frameId: number;

    const animate = () => {
      setPositionY((prev) => {
        if (prev <= -100) return window.innerHeight - 80; // reset
        return prev - 10;
      });
      frameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <div
      style={{
        position: 'absolute',
        top: positionY,
        left: positionX,
        width: '8px',
        height: '40px',
        backgroundColor: 'red',
        zIndex: 10,
      }}
    />
  );
};

export default Laser;
