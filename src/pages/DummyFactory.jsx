import { useState } from "react";
import Header from "@/components/dummyFactory/Header";
import FileTypeSelector from "@/components/dummyFactory/FileTypeSelector";
import FileCrafter from "@/components/dummyFactory/FileCrafter";
import ProTipCard from "@/components/dummyFactory/ProTipCard";
import AdSense from "@/components/AdSense";
import { FILE_CATEGORIES } from "@/constants/dummyFactory/fileTypes";
import { TRANSLATIONS } from "@/constants/dummyFactory/translations";
import {
  generateDummyBlob,
  downloadFile,
} from "@/utils/dummyFactory/fileGenerator";
import {
  validateSize,
  calculateVisualFeedback,
} from "@/utils/dummyFactory/sizeValidator";

/**
 * Dummy Factory 메인 컴포넌트
 * 더미 파일을 생성하고 다운로드할 수 있는 애플리케이션
 */
export default function DummyFactory() {
  // State
  const [lang, setLang] = useState("ko"); // 기본값: 한국어
  const [selectedCategory, setSelectedCategory] = useState(FILE_CATEGORIES[0]);
  const [selectedExt, setSelectedExt] = useState(
    FILE_CATEGORIES[0].extensions[0]
  );
  const [sizeMB, setSizeMB] = useState(5);
  const [fileName, setFileName] = useState("dummy_sample");
  const [isDownloading, setIsDownloading] = useState(false);
  const [confetti, setConfetti] = useState([]);

  const t = TRANSLATIONS[lang];

  // 언어 전환
  const toggleLang = () => setLang((prev) => (prev === "en" ? "ko" : "en"));

  // 카테고리 변경 시 첫 번째 확장자로 자동 선택
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedExt(category.extensions[0]);
  };

  // 파일 크기 변경 핸들러
  const handleSizeChange = (val) => {
    const validatedSize = validateSize(val);
    setSizeMB(validatedSize);
  };

  // 파일 다운로드 핸들러
  const handleDownload = () => {
    setIsDownloading(true);

    // 컨페티 효과 트리거
    const newParticles = Array.from({ length: 30 }).map((_, i) => i);
    setConfetti(newParticles);

    // 파일 생성 및 다운로드 시뮬레이션
    setTimeout(() => {
      const blob = generateDummyBlob(selectedExt, sizeMB);
      const fullFileName = `${fileName}${selectedExt}`;
      downloadFile(blob, fullFileName);

      setIsDownloading(false);
      setTimeout(() => setConfetti([]), 2000); // 컨페티 정리
    }, 800);
  };

  // 시각적 피드백 계산
  const { heavyY, textY } = calculateVisualFeedback(sizeMB);

  // AdSense 환경 변수 (슬롯 ID만 필요)
  const sidebarSlot = import.meta.env.VITE_ADSENSE_SLOT_SIDEBAR;
  const footerSlot = import.meta.env.VITE_ADSENSE_SLOT_FOOTER;

  return (
    <div className="min-h-screen bg-[#FFFBEB] text-gray-900 font-sans selection:bg-black selection:text-white flex flex-col">
      {/* HEADER */}
      <Header
        subtitle={t.subtitle}
        currentLang={lang}
        onToggleLang={toggleLang}
      />

      {/* MAIN CONTENT GRID */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT COLUMN: 파일 카테고리 선택 */}
        <FileTypeSelector
          selectedCategory={selectedCategory}
          onSelectCategory={handleCategoryChange}
          lang={lang}
        />

        {/* RIGHT COLUMN: 파일 제작 영역 */}
        <FileCrafter
          selectedCategory={selectedCategory}
          selectedExt={selectedExt}
          sizeMB={sizeMB}
          heavyY={heavyY}
          textY={textY}
          onExtChange={setSelectedExt}
          onSizeChange={handleSizeChange}
          fileName={fileName}
          onFileNameChange={setFileName}
          isDownloading={isDownloading}
          onDownload={handleDownload}
          confetti={confetti}
          translations={t}
        />
      </main>

      {/* PRO TIP CARD */}
      <div className="max-w-7xl mx-auto w-full px-4 md:px-10 pb-8">
        <ProTipCard title={t.proTipTitle} description={t.proTipContent} />

        {/* FOOTER AD */}
        {/* {footerSlot && (
          <div className="mt-8 pt-8 border-t-2 border-black/5">
            <AdSense
              slot={footerSlot}
              format="auto"
              responsive={true}
              className="text-center"
            />
          </div>
        )} */}
      </div>
    </div>
  );
}
