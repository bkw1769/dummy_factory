/**
 * 코드 블록 컴포넌트
 * @param {Object} props
 * @param {string} props.code - 표시할 코드
 * @param {string} props.placeholder - 플레이스홀더 텍스트
 */
export default function CodeBlock({ code, placeholder }) {
  return (
    <div className="relative group h-full flex flex-col">
      <div className="h-8 bg-gray-100 border-b-2 border-black flex items-center px-2 gap-1.5 shrink-0 rounded-t-xl">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400 border border-black/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-black/20"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-green-400 border border-black/20"></div>
      </div>
      <textarea
        readOnly
        value={code}
        placeholder={placeholder}
        className="w-full flex-1 p-4 font-mono text-sm bg-white resize-none focus:outline-none text-gray-700 leading-relaxed rounded-b-xl"
      />
    </div>
  );
}

