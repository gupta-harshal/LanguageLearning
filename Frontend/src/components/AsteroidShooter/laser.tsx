import { useEffect, useRef, useState } from 'react';

interface LaserProps {
  fromX: number;
  toX: number;
  startBottom: number;
  targetBottom: number;
  onComplete: () => void;
  durationMs?: number;
}

const Laser = ({
  fromX,
  toX,
  startBottom,
  targetBottom,
  onComplete,
  durationMs = 210,
}: LaserProps) => {
  const [isFiring, setIsFiring] = useState(false);
  const didCompleteRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const deltaX = toX - fromX;
  const deltaY = targetBottom - startBottom;
  const distance = Math.max(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 42);
  const angleDeg = (Math.atan2(deltaX, deltaY) * 180) / Math.PI;

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setIsFiring(true);
    });

    const completeTimer = setTimeout(() => {
      if (didCompleteRef.current) {
        return;
      }

      didCompleteRef.current = true;
      onCompleteRef.current();
    }, durationMs + 40);

    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(completeTimer);
    };
  }, [durationMs]);

  return (
    <div
      className="pointer-events-none absolute z-35"
      style={{
        left: fromX,
        bottom: startBottom,
        transform: `translateX(-50%) rotate(${angleDeg}deg)`,
      }}
    >
      <div
        className="absolute bottom-0 left-[-3px] w-[6px] origin-bottom rounded-t-full bg-gradient-to-t from-red-500 to-red-200 shadow-[0_0_14px_rgba(254,161,161,0.9),0_0_28px_rgba(239,68,68,0.7)] transition-[transform,opacity] ease-out"
        style={{
          height: `${distance}px`,
          transform: isFiring ? 'scaleY(1)' : 'scaleY(0.08)',
          opacity: isFiring ? 1 : 0,
          transitionDuration: `${durationMs}ms`,
        }}
      >
        <div className="pointer-events-none absolute inset-x-[-5px] top-[-32px] h-[34px] rounded-full bg-gradient-to-b from-red-100/75 to-red-100/0" />
      </div>
    </div>
  );
};

export default Laser;
