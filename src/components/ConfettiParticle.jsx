import { motion } from "framer-motion";

/**
 * 다운로드 시 표시되는 컨페티 파티클 컴포넌트
 * @param {Object} props
 * @param {number} props.delay - 애니메이션 지연 시간
 */
export default function ConfettiParticle({ delay }) {
  const x = Math.random() * 400 - 200;
  const y = Math.random() * -300 - 100;
  const rotate = Math.random() * 360;
  const colors = ["#F472B6", "#34D399", "#60A5FA", "#FBBF24", "#A78BFA"];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <motion.div
      initial={{ opacity: 1, x: 0, y: 0, scale: 0 }}
      animate={{
        opacity: 0,
        x: x,
        y: y,
        rotate: rotate,
        scale: [0, 1.5, 0],
      }}
      transition={{ duration: 1.5, delay: delay, ease: "easeOut" }}
      className="absolute top-1/2 left-1/2 w-3 h-3 rounded-sm pointer-events-none"
      style={{ backgroundColor: color }}
    />
  );
}

