import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

/**
 * 옵션 토글 컴포넌트
 * @param {Object} props
 * @param {string} props.label - 라벨 텍스트
 * @param {React.ComponentType} props.icon - 아이콘 컴포넌트
 * @param {boolean} props.active - 활성화 여부
 * @param {Function} props.onClick - 클릭 핸들러
 */
export default function ToggleOption({ label, icon: Icon, active, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center justify-between w-full p-4 rounded-xl border-2 transition-all
        ${
          active
            ? "bg-blue-100 border-blue-500 text-blue-900 shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]"
            : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
        }
      `}
    >
      <div className="flex items-center gap-3">
        <div
          className={`p-2 rounded-lg ${
            active ? "bg-blue-500 text-white" : "bg-gray-100"
          }`}
        >
          <Icon size={18} />
        </div>
        <span className="font-bold text-sm text-left">{label}</span>
      </div>
      <div
        className={`
          w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
          ${active ? "bg-blue-500 border-blue-500" : "border-gray-300"}
        `}
      >
        {active && <CheckCircle2 size={14} className="text-white" />}
      </div>
    </motion.button>
  );
}

