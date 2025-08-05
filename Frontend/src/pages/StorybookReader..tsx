import React, { useState, useEffect } from 'react';
import woodenImage from '../assets/wooden.png';
import scrollEnd from '../assets/scroll-end.svg';

export default function JapaneseScroll() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setTimeout(() => setOpen(true), 300);
  }, []);

  const paperWidthPercent = 75;
  const paperHeight = 600; // px, use '70vh' for viewport height if needed
  const endHeight = 64; // px, matches container height for scroll ends

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-start py-12"
      style={{ backgroundImage: `url(${woodenImage})` }}
    >
      <div
        className="relative flex flex-col items-center"
        style={{
          width: `${paperWidthPercent}vw`,
          minHeight: paperHeight + endHeight * 2
        }}
      >
        {/* Top scroll end */}
        <div
          style={{
            width: '100%',
            height: `${endHeight}px`,
            overflow: 'hidden',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <img
            src={scrollEnd}
            alt="Scroll Top End"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>

        {/* Scroll paper */}
        <div
          className={`bg-white bg-opacity-95 border-x-8 border-yellow-900 shadow-lg overflow-hidden transition-all duration-2000 ease-out ${open ? 'opacity-100' : 'opacity-0'}`}
          style={{
            width: '100%',
            height: open ? `${paperHeight}px` : 0,
            marginTop: `-${Math.floor(endHeight / 4)}px`, // Small negative margin for overlap
            transformOrigin: 'top center',
            transitionProperty: 'height, opacity',
            transitionDuration: '2000ms',
            transitionTimingFunction: 'ease',
            zIndex: 1,
          }}
        >
          <div className="p-6 text-gray-800 h-full overflow-y-auto">
            <h1 className="font-serif text-2xl mb-4 text-center">
              The Tale of the Blossoming Sakura
            </h1>
            <p>
              Once upon a time in ancient Japan, a paper scroll revealed stories of courage and beauty...
            </p>
          </div>
        </div>

        {/* Bottom scroll end */}
        <div
          style={{
            width: '100%',
            height: `${endHeight}px`,
            overflow: 'hidden',
            position: 'absolute',
            left: 0,
            top: open ? `${paperHeight + Math.floor(-endHeight / 4)}px` : 0, // Stays flush as the paper grows
            opacity: open ? 1 : 0,
            transition: 'top 2000ms ease, opacity 2000ms ease',
            zIndex: 2,
          }}
        >
          <img
            src={scrollEnd}
            alt="Scroll Bottom End"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        </div>
      </div>
    </div>
  );
}
