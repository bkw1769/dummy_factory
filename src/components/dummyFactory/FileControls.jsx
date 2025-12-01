import { motion } from "framer-motion";
import { Download, RefreshCcw } from "lucide-react";
import ConfettiParticle from "./ConfettiParticle";
import ExtensionChip from "./ExtensionChip";

/**
 * 파일 생성 컨트롤 컴포넌트
 * @param {Object} props
 * @param {Array} props.extensions - 선택 가능한 확장자 배열
 * @param {string} props.selectedExt - 선택된 확장자
 * @param {Function} props.onExtChange - 확장자 변경 핸들러
 * @param {number} props.sizeMB - 파일 크기 (MB)
 * @param {Function} props.onSizeChange - 크기 변경 핸들러
 * @param {string} props.fileName - 파일명
 * @param {Function} props.onFileNameChange - 파일명 변경 핸들러
 * @param {boolean} props.isDownloading - 다운로드 중 여부
 * @param {Function} props.onDownload - 다운로드 핸들러
 * @param {Array} props.confetti - 컨페티 파티클 배열
 * @param {Object} props.translations - 번역 객체
 */
export default function FileControls({
  extensions,
  selectedExt,
  onExtChange,
  sizeMB,
  onSizeChange,
  fileName,
  onFileNameChange,
  isDownloading,
  onDownload,
  confetti,
  translations,
}) {
  return (
    <div className="space-y-6 relative z-10 mt-auto">
      {/* Extension Selector */}
      <div className="mb-8">
        <label className="block text-xs font-black text-gray-400 mb-3 tracking-wider">
          {translations.extensionLabel}
        </label>
        <div className="flex flex-wrap gap-2">
          {extensions.map((ext) => (
            <ExtensionChip
              key={ext}
              ext={ext}
              isSelected={selectedExt === ext}
              onClick={() => onExtChange(ext)}
            />
          ))}
        </div>
      </div>

      {/* Size Slider & Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="font-bold text-sm">{translations.fileSize}</label>
          <input
            type="number"
            value={sizeMB}
            onChange={(e) => onSizeChange(e.target.value)}
            className="w-24 p-1 text-right font-bold bg-gray-100 rounded border-2 border-gray-200 focus:border-black outline-none"
          />
        </div>
        <input
          type="range"
          min="0"
          max="2000"
          value={sizeMB}
          onChange={(e) => onSizeChange(e.target.value)}
          className="w-full h-3 bg-gray-200 rounded-full appearance-none cursor-pointer border-2 border-black
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-6
            [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:bg-yellow-400
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-black
            [&::-webkit-slider-thumb]:hover:scale-110
            [&::-webkit-slider-thumb]:transition-all
          "
        />
      </div>

      {/* Filename Input */}
      <div className="space-y-2">
        <label className="font-bold text-sm">{translations.filename}</label>
        <div className="flex">
          <input
            type="text"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            className="flex-1 p-3 font-bold bg-white rounded-l-xl border-2 border-black border-r-0 focus:bg-yellow-50 outline-none transition-colors"
          />
          <div className="bg-black text-white px-4 flex items-center justify-center rounded-r-xl font-bold border-2 border-black min-w-[4rem]">
            {selectedExt}
          </div>
        </div>
      </div>

      {/* ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={onDownload}
        disabled={isDownloading}
        className="w-full bg-black text-white py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 relative overflow-hidden group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] transition-all"
      >
        {/* Background Animation on Hover */}
        <div className="absolute inset-0 bg-gray-800 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />

        <span className="relative z-10 flex items-center gap-2">
          {isDownloading ? (
            <RefreshCcw className="animate-spin" />
          ) : (
            <>
              <Download size={24} />
              {translations.mintBtn}
            </>
          )}
        </span>

        {/* Confetti Anchor */}
        {confetti.map((i) => (
          <ConfettiParticle key={i} delay={i * 0.05} />
        ))}
      </motion.button>
    </div>
  );
}
