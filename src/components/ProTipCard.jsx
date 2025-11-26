import { Sparkles } from "lucide-react";

/**
 * 프로 팁 카드 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 팁 제목
 * @param {string} props.description - 팁 설명
 */
export default function ProTipCard({ title, description }) {
  return (
    <div className="bg-[#FF90E8] p-6 rounded-2xl border-4 border-black text-black">
      <h3 className="font-bold text-lg flex items-center gap-2">
        <Sparkles size={20} />
        {title}
      </h3>
      <p className="text-sm font-medium mt-2 leading-relaxed">{description}</p>
    </div>
  );
}

