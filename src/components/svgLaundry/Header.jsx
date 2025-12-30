import { Shirt, Sparkles, Globe, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * SVG Laundry 헤더 컴포넌트
 * @param {Object} props
 * @param {string} props.title - 타이틀 텍스트
 * @param {string} props.subtitle - 서브타이틀 텍스트
 * @param {string} props.openText - 오픈 시간 텍스트
 * @param {string} props.currentLang - 현재 언어 ('en' | 'ko')
 * @param {Function} props.onToggleLang - 언어 전환 핸들러
 */
export default function Header({
  title,
  subtitle,
  openText,
  currentLang,
  onToggleLang,
}) {
  const navigate = useNavigate();

  return (
    <header className="p-6 md:p-8 flex items-center justify-between border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors border-2 border-transparent hover:border-black"
        >
          <ArrowRight className="rotate-180" size={24} />
        </button>
        <div className="bg-blue-500 text-white p-2.5 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Shirt size={28} strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic">
            {title}
          </h1>
          <p className="text-xs font-bold text-gray-400 tracking-wide">
            {subtitle}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {/* Language Toggle */}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border-2 border-transparent hover:bg-gray-100 transition-all active:scale-95"
        >
          <Globe size={18} />
          <span className="text-sm">
            {currentLang === "en" ? "KOR" : "ENG"}
          </span>
        </button>
        <div className="hidden md:flex items-center gap-2 bg-yellow-300 px-4 py-1.5 rounded-full border-2 border-black font-bold text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <Sparkles size={16} />
          <span>{openText}</span>
        </div>
      </div>
    </header>
  );
}
