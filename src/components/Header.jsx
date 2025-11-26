import { Box, Globe } from "lucide-react";

/**
 * 애플리케이션 헤더 컴포넌트
 * @param {Object} props
 * @param {string} props.subtitle - 서브타이틀 텍스트
 * @param {string} props.repoText - 저장소 링크 텍스트
 * @param {string} props.currentLang - 현재 언어 ('en' | 'ko')
 * @param {Function} props.onToggleLang - 언어 전환 핸들러
 */
export default function Header({ subtitle, repoText, currentLang, onToggleLang }) {
  return (
    <header className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-black/5">
      <div className="flex items-center gap-3">
        <div className="bg-black text-white p-2 rounded-lg transform -rotate-6 shadow-md">
          <Box size={28} />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none">
            DUMMY FACTORY
          </h1>
          <p className="text-xs md:text-sm font-bold text-gray-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3 py-2 rounded-lg font-bold border-2 border-transparent hover:bg-black/5 transition-all active:scale-95"
        >
          <Globe size={20} />
          <span className="text-sm">{currentLang === "en" ? "ENG" : "KOR"}</span>
        </button>

        <a
          href="#"
          className="hidden md:block font-bold underline decoration-4 decoration-pink-400 hover:text-pink-500"
        >
          {repoText}
        </a>
      </div>
    </header>
  );
}
