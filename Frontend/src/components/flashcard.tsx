interface FlashcardProps {
  text: string;
}

export default function Flashcard({ text }: FlashcardProps) {
  return (
    <div className="bg-red-500 h-100 flex">
      {text}
    </div>
  );
}
