import { motion } from "framer-motion";

/**
 * 확장자 선택 칩 컴포넌트
 * @param {Object} props
 * @param {string} props.ext - 확장자 문자열
 * @param {boolean} props.isSelected - 선택 여부
 * @param {Function} props.onClick - 클릭 핸들러
 */
export default function ExtensionChip({ ext, isSelected, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-4 py-2 rounded-xl font-bold text-sm border-2 transition-all
        ${
          isSelected
            ? "bg-black text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            : "bg-white text-gray-600 border-gray-200 hover:border-black hover:bg-gray-50"
        }
      `}
    >
      {ext}
    </motion.button>
  );
}

