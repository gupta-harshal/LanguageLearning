import cloud from '../assets/cloud.svg';

interface CloudProps {
  text: string;
}

export default function Cloud({ text }: CloudProps) {
  return (
    <div className="relative flex items-center justify-center h-[120px] min-w-[200px] w-fit px-4 py-2">
      <img
        src={cloud}
        alt="cloud"
        className="absolute inset-0 w-full h-full object-fill z-0"
      />
      <div className="relative z-10 text-black text-lg font-semibold whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}
