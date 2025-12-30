import { motion } from "framer-motion";
import { Download, RefreshCcw, ShieldCheck, FileWarning, AlertTriangle } from "lucide-react";
import ConfettiParticle from "./ConfettiParticle";
import ExtensionChip from "./ExtensionChip";
import { isExtensionSupported } from "@/constants/dummyFactory/fileTypes";

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
 * @param {boolean} props.isBroken - 깨진 파일 여부
 * @param {Function} props.onIntegrityChange - 무결성 변경 핸들러
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
  isBroken = false,
  onIntegrityChange,
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

      {/* Integrity Toggle or Binary-Only Notice */}
      {onIntegrityChange && (
        isExtensionSupported(selectedExt) ? (
          <div className="mb-8 p-1 bg-gray-100 rounded-xl border-2 border-black/10 flex">
            <button
              onClick={() => onIntegrityChange(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${
                !isBroken
                  ? "bg-white text-green-600 shadow-sm border border-black/10"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <ShieldCheck size={16} /> {translations.integrityNormal}
            </button>
            <button
              onClick={() => onIntegrityChange(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-bold text-sm transition-all ${
                isBroken
                  ? "bg-gray-800 text-white shadow-sm border border-black/10"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <FileWarning size={16} /> {translations.integrityBroken}
            </button>
          </div>
        ) : (
          <div className="mb-8 p-4 bg-amber-50 rounded-xl border-2 border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-amber-600" />
              <span className="font-bold text-sm text-amber-700">
                {translations.binaryOnlyLabel}
              </span>
            </div>
            <p className="text-xs text-amber-600 leading-relaxed">
              {translations.binaryOnlyNotice}
            </p>
          </div>
        )
      )}

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
