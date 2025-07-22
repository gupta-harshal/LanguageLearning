import cloud from '../../assets/cloud.svg';
import Draggable from '../../utils/FlashCardReading/drag';

interface CloudProps {
  id: string;             // 👈 Required draggable ID
  text: string;
  className?: string;
}

// Renders the cloud-shaped visual component with text inside
function helper({ text, className = '' }: Omit<CloudProps, 'id'>) {
  return (
    <div className={`relative flex items-center justify-center h-[120px] min-w-[200px] w-fit px-4 py-2 ${className}`}>
      <img
        src={cloud}
        alt="cloud"
        className="absolute inset-0 w-full h-full object-fill z-0"
      />
      <div className="relative z-10 font-anglo-japan text-black text-lg font-semibold whitespace-nowrap">
        {text}
      </div>
    </div>
  );
}

// Wraps the cloud in a draggable wrapper with unique ID
export default function Cloud({ id, text, className }: CloudProps) {
  return <Draggable id={id}>{helper({ text, className })}</Draggable>;
}
