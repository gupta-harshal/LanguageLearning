import { useRecoilState } from "recoil";
import { score } from "../../atoms/flashcardreading/score";

export default function Score() {
    const [Score]= useRecoilState(score);
  return (
    <div className="relative z-10 font-anglo-japan text-white text-4xl font-semibold whitespace-nowrap">
      Score: {Score}
    </div>
  );
}
