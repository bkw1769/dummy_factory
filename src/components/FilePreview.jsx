import { motion, AnimatePresence } from "framer-motion";

/**
 * 파일 미리보기 영역 컴포넌트
 * @param {Object} props
 * @param {Object} props.selectedCategory - 선택된 카테고리
 * @param {string} props.selectedExt - 선택된 확장자
 * @param {number} props.sizeMB - 파일 크기 (MB)
 * @param {number} props.heavyY - 무게에 따른 Y축 이동값
 * @param {number} props.textY - 텍스트 Y축 위치
 */
export default function FilePreview({
  selectedCategory,
  selectedExt,
  sizeMB,
  heavyY,
  textY,
}) {
  return (
    <div className="flex flex-col items-center justify-center mb-8 h-32 relative z-0">
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory.id}
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0, y: heavyY }}
          exit={{ scale: 0, rotate: 20 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="relative"
        >
          <motion.div
            style={{ scale: 1 + sizeMB / 3000 }}
            className={`w-20 h-20 ${selectedCategory.color} rounded-2xl border-4 border-black flex items-center justify-center text-white shadow-lg z-10 relative`}
          >
            <selectedCategory.icon size={40} strokeWidth={2.5} />
            <span className="absolute -bottom-2 -right-2 bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-bold border border-white">
              {selectedExt}
            </span>
          </motion.div>

          <motion.div
            style={{ opacity: 0.2 + sizeMB / 3000 }}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full blur-md -z-10"
          />
        </motion.div>
      </AnimatePresence>

      <motion.p animate={{ y: textY }} className="mt-4 font-bold text-gray-500 text-lg">
        {sizeMB} MB
      </motion.p>
    </div>
  );
}
