import { Code, Eye } from "lucide-react";

/**
 * 뷰 토글 컴포넌트
 * @param {Object} props
 * @param {string} props.mode - 현재 모드 ('code' | 'preview')
 * @param {Function} props.setMode - 모드 변경 핸들러
 * @param {Object} props.labels - 라벨 객체
 */
export default function ViewToggle({ mode, setMode, labels }) {
  return (
    <div className="flex bg-gray-100 p-1 rounded-xl border-2 border-black/10">
      <button
        onClick={() => setMode("code")}
        className={`
          flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap
          ${
            mode === "code"
              ? "bg-white text-black shadow-sm border border-black/10"
              : "text-gray-400 hover:text-gray-600"
          }
        `}
      >
        <Code size={16} /> {labels.codeBtn}
      </button>
      <button
        onClick={() => setMode("preview")}
        className={`
          flex-[1.3] flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all whitespace-nowrap
          ${
            mode === "preview"
              ? "bg-white text-black shadow-sm border border-black/10"
              : "text-gray-400 hover:text-gray-600"
          }
        `}
      >
        <Eye size={16} /> {labels.previewBtn}
      </button>
    </div>
  );
}
