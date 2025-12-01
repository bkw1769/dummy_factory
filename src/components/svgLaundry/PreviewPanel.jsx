import { Sun, Moon, Palette, Grid } from "lucide-react";

/**
 * 미리보기 패널 컴포넌트
 * @param {Object} props
 * @param {string} props.svgCode - SVG 코드
 * @param {Object} props.labels - 라벨 객체
 */
export default function PreviewPanel({ svgCode, labels }) {
  if (!svgCode) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 font-bold bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        {labels.emptyState}
      </div>
    );
  }

  // 실제 렌더링을 위해 간단한 정제 (JSX wrapper 제거 등)
  const renderCode = svgCode
    .replace(/const IconComponent = \(props\) => \(\n/, "")
    .replace(/\n\);$/, "")
    .replace(/\{\.\.\.props\}/, "");

  const svgWrapperClass =
    "w-24 h-24 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:object-contain";

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Light Mode */}
      <div className="bg-white border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 gap-2 overflow-hidden">
        <div className="text-gray-400 mb-2">
          <Sun size={20} />
        </div>
        <div
          className={`${svgWrapperClass} text-gray-800`}
          dangerouslySetInnerHTML={{ __html: renderCode }}
        />
        <span className="text-xs font-bold text-gray-400 mt-2">
          {labels.light}
        </span>
      </div>

      {/* Dark Mode */}
      <div className="bg-gray-900 border-2 border-black rounded-xl flex flex-col items-center justify-center p-4 gap-2 overflow-hidden">
        <div className="text-gray-500 mb-2">
          <Moon size={20} />
        </div>
        <div
          className={`${svgWrapperClass} text-white`}
          dangerouslySetInnerHTML={{ __html: renderCode }}
        />
        <span className="text-xs font-bold text-gray-500 mt-2">
          {labels.dark}
        </span>
      </div>

      {/* Brand Color Mode */}
      <div className="bg-blue-500 border-2 border-blue-600 rounded-xl flex flex-col items-center justify-center p-4 gap-2 overflow-hidden">
        <div className="text-blue-200 mb-2">
          <Palette size={20} />
        </div>
        <div
          className={`${svgWrapperClass} text-white`}
          dangerouslySetInnerHTML={{ __html: renderCode }}
        />
        <span className="text-xs font-bold text-blue-200 mt-2">
          {labels.brand}
        </span>
      </div>

      {/* Grid (Transparent) Mode */}
      <div className="bg-white border-2 border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 gap-2 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
          }}
        />
        <div className="relative z-10 text-gray-400 mb-2">
          <Grid size={20} />
        </div>
        <div
          className={`${svgWrapperClass} relative z-10 text-black`}
          dangerouslySetInnerHTML={{ __html: renderCode }}
        />
        <span className="relative z-10 text-xs font-bold text-gray-400 mt-2">
          {labels.transparent}
        </span>
      </div>
    </div>
  );
}

