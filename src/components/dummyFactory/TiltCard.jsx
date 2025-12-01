import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

/**
 * 3D 틸트 효과가 있는 카테고리 선택 카드 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 카테고리 데이터 (icon, color 포함)
 * @param {boolean} props.isSelected - 선택 여부
 * @param {Function} props.onClick - 클릭 핸들러
 * @param {string} props.lang - 현재 언어 ('en' | 'ko')
 */
export default function TiltCard({ data, isSelected, onClick, lang }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / rect.width);
    y.set((e.clientY - rect.top - rect.height / 2) / rect.height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const Icon = data.icon;
  const labelText = lang === "ko" ? data.labelKo : data.label;

  return (
    <motion.div
      style={{
        rotateX: isSelected ? 0 : rotateX,
        rotateY: isSelected ? 0 : rotateY,
        perspective: 1000,
      }}
      className="relative z-10"
    >
      <motion.button
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={{
          scale: isSelected ? 1.05 : 1,
          borderColor: isSelected ? "#000" : "rgba(0,0,0,0.05)",
        }}
        className={`
          relative flex flex-col items-center justify-center 
          w-full aspect-square rounded-2xl border-4 
          transition-all duration-300
          ${
            isSelected
              ? "bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
              : "bg-white/40 hover:bg-white/80 border-transparent"
          }
        `}
      >
        <div
          className={`p-4 rounded-xl border-2 border-black ${data.color} text-white mb-3 shadow-sm`}
        >
          <Icon size={32} strokeWidth={2.5} />
        </div>
        <span className="font-bold text-gray-800 text-sm md:text-base">
          {labelText}
        </span>

        {isSelected && (
          <motion.div
            layoutId="selection-ring"
            className="absolute inset-0 rounded-2xl border-4 border-black pointer-events-none"
          />
        )}
      </motion.button>
    </motion.div>
  );
}
