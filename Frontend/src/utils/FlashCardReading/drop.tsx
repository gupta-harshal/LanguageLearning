import { useDroppable } from '@dnd-kit/core';
import Orb from '../../components/FlashCardReading/orb';

export default function DroppableOrb() {
  const { setNodeRef } = useDroppable({ id: 'orb' });

  return (
    <div ref={setNodeRef}>
      <Orb text="This Word" />
    </div>
  );
}
