import FilePreview from "./FilePreview";
import FileControls from "./FileControls";

/**
 * 파일 제작 영역 컴포넌트 (미리보기 + 컨트롤)
 * @param {Object} props
 * @param {Object} props.selectedCategory - 선택된 카테고리
 * @param {string} props.selectedExt - 선택된 확장자
 * @param {number} props.sizeMB - 파일 크기 (MB)
 * @param {number} props.heavyY - 무게에 따른 Y축 이동값
 * @param {number} props.textY - 텍스트 Y축 위치
 * @param {Function} props.onExtChange - 확장자 변경 핸들러
 * @param {Function} props.onSizeChange - 크기 변경 핸들러
 * @param {string} props.fileName - 파일명
 * @param {Function} props.onFileNameChange - 파일명 변경 핸들러
 * @param {boolean} props.isDownloading - 다운로드 중 여부
 * @param {Function} props.onDownload - 다운로드 핸들러
 * @param {Array} props.confetti - 컨페티 파티클 배열
 * @param {Object} props.translations - 번역 객체
 */
export default function FileCrafter({
  selectedCategory,
  selectedExt,
  sizeMB,
  heavyY,
  textY,
  onExtChange,
  onSizeChange,
  fileName,
  onFileNameChange,
  isDownloading,
  onDownload,
  confetti,
  translations,
}) {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      {/* Preview & Controls Card */}
      <div className="bg-white rounded-[2rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 relative overflow-hidden flex flex-col h-full">
        {/* Background Decoration */}
        <div className="absolute -top-10 -right-10 w-40 h-40 pointer-events-none"></div>

        <div className="flex items-center gap-2 mb-6 relative z-10">
          <span className="bg-blue-400 text-black px-3 py-1 rounded-full font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {translations.step2Tag}
          </span>
          <h2 className="text-xl font-bold">{translations.step2Title}</h2>
        </div>

        {/* PREVIEW AREA */}
        <FilePreview
          selectedCategory={selectedCategory}
          selectedExt={selectedExt}
          sizeMB={sizeMB}
          heavyY={heavyY}
          textY={textY}
        />

        {/* CONTROLS */}
        <FileControls
          extensions={selectedCategory.extensions}
          selectedExt={selectedExt}
          onExtChange={onExtChange}
          sizeMB={sizeMB}
          onSizeChange={onSizeChange}
          fileName={fileName}
          onFileNameChange={onFileNameChange}
          isDownloading={isDownloading}
          onDownload={onDownload}
          confetti={confetti}
          translations={translations}
        />
      </div>
    </div>
  );
}
