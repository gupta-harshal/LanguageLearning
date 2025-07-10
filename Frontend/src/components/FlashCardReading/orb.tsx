interface OrbProps {
  text: string;
}

export default function Orb({ text }: OrbProps) {
  return (
    <div
      className={`h-40 w-40 rounded-full transition-all duration-300
                  flex items-center justify-center bg-purple-500 shadow-lg`}
    >
      <span className="text-white font-bold">{text}</span>
    </div>
  );
}
