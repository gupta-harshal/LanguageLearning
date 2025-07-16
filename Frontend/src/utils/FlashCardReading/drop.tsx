import { useDroppable } from '@dnd-kit/core';
import type { ReactNode } from 'react';

interface DroppableProps {
  id: string;
  children: ReactNode;
}

export default function Droppable({ id, children }: DroppableProps) {
  const { setNodeRef } = useDroppable({ id });

  return <div ref={setNodeRef}>{children}</div>;
}
