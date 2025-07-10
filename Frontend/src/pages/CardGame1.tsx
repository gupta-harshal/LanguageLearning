import React from 'react';
import Cloud from '../components/FlashCardReading/cloud';
import Orb from '../components/FlashCardReading/orb';
import { DndContext } from '@dnd-kit/core';

export default function CardGame1() {
  return (
    <DndContext>
      <div className="flex flex-col items-center justify-center h-screen relative light bg-gradient-to-b from-[#80E2DD] via-white to-[#45CFFB]">
        <div className="absolute top-0 left-0">
            <Cloud text="Hello!" />
        </div>
        <div className="mt-10">
          <Orb text="This Word" />
        </div>
      </div>
    </DndContext>
  );
}
