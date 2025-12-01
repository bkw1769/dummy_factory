import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  ArrowRight,
  Settings,
  CheckCircle2,
  Scissors,
  Palette,
  Code,
  Eraser,
} from "lucide-react";
import Header from "@/components/svgLaundry/Header";
import ToggleOption from "@/components/svgLaundry/ToggleOption";
import CodeBlock from "@/components/svgLaundry/CodeBlock";
import PreviewPanel from "@/components/svgLaundry/PreviewPanel";
import ViewToggle from "@/components/svgLaundry/ViewToggle";
import { TRANSLATIONS } from "@/constants/svgLaundry/translations";
import { DEFAULT_SVG, processSVG } from "@/utils/svgLaundry/svgProcessor";

/**
 * SVG Laundry 메인 페이지 컴포넌트
 * 지저분한 SVG 코드를 깨끗하게 정리해주는 도구
 */
export default function SvgLaundry() {
  const [lang, setLang] = useState("ko"); // 기본값: 한국어
  const [inputCode, setInputCode] = useState(DEFAULT_SVG);

  // 상태 분리: 결과 코드와 미리보기용 코드를 별도로 관리
  const [outputCode, setOutputCode] = useState("");
  const [previewCode, setPreviewCode] = useState("");

  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState("code");

  const t = TRANSLATIONS[lang];

  // Options State
  const [options, setOptions] = useState({
    minify: true,
    currentColor: true,
    jsx: true,
  });

  // 실시간 변환 (100ms 디바운스 적용)
  useEffect(() => {
    const timer = setTimeout(() => {
      const processed = processSVG(inputCode, options);
      const preview = processSVG(inputCode, { ...options, jsx: false });

      setOutputCode(processed);
      setPreviewCode(preview);
    }, 100);
    return () => clearTimeout(timer);
  }, [inputCode, options]);

  const copyToClipboard = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-cyan-50 text-gray-900 font-sans flex flex-col">
      {/* HEADER */}
      <Header
        title={t.title}
        subtitle={t.subtitle}
        openText={t.open}
        currentLang={lang}
        onToggleLang={() => setLang((l) => (l === "en" ? "ko" : "en"))}
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: WASHING MACHINE (INPUT) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-6 relative overflow-hidden flex-1">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-gray-900 text-white px-3 py-1 rounded-full font-bold text-xs border-2 border-black">
                {t.dirty}
              </span>
              <button
                onClick={() => setInputCode("")}
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                title={t.clear}
              >
                <Eraser size={20} />
              </button>
            </div>
            <div className="relative mb-6">
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder={t.placeholder}
                className="w-full h-60 bg-gray-100 rounded-2xl border-4 border-dashed border-gray-300 p-4 font-mono text-xs focus:bg-blue-50 focus:border-blue-400 focus:outline-none transition-colors resize-none"
              />
              <div className="absolute -bottom-2 -right-2 bg-pink-400 text-white text-xs font-black px-2 py-1 rotate-[-6deg] border border-black shadow-sm">
                {t.drop}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-sm text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Settings size={14} /> {t.detergents}
              </h3>

              <ToggleOption
                label={t.optCurrentColor}
                icon={Palette}
                active={options.currentColor}
                onClick={() =>
                  setOptions({
                    ...options,
                    currentColor: !options.currentColor,
                  })
                }
              />
              <ToggleOption
                label={t.optJsx}
                icon={Code}
                active={options.jsx}
                onClick={() => setOptions({ ...options, jsx: !options.jsx })}
              />
              <ToggleOption
                label={t.optMinify}
                icon={Scissors}
                active={options.minify}
                onClick={() =>
                  setOptions({ ...options, minify: !options.minify })
                }
              />
            </div>
          </div>

          {/* 'START WASHING' Button removed. Auto-processing is active. */}
        </div>

        {/* CENTER ARROW (Desktop Only) */}
        <div className="hidden lg:flex col-span-1 items-center justify-center">
          <ArrowRight size={48} className="text-black/20" strokeWidth={4} />
        </div>

        {/* RIGHT COLUMN: IRONING BOARD (OUTPUT) */}
        <div className="lg:col-span-6">
          <div className="h-full flex flex-col">
            <div className="flex-1 bg-white rounded-[2.5rem] border-4 border-black shadow-[12px_12px_0px_0px_rgba(59,130,246,0.3)] p-8 relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              <div className="flex flex-wrap items-center justify-between mb-6 relative z-10 gap-4">
                <div className="flex items-center gap-3">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {t.fresh}
                  </span>
                  {options.jsx && (
                    <span className="text-xs font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded">
                      .jsx
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <ViewToggle
                    mode={viewMode}
                    setMode={setViewMode}
                    labels={t}
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={copyToClipboard}
                    className="bg-black text-white p-2.5 rounded-lg border-2 border-black shadow-md hover:bg-gray-800 transition-colors"
                    title="Copy Code"
                  >
                    {copied ? (
                      <CheckCircle2 size={20} className="text-green-400" />
                    ) : (
                      <Copy size={20} />
                    )}
                  </motion.button>
                </div>
              </div>
              <div className="relative z-10 flex-1 rounded-xl overflow-hidden border-2 border-black bg-white shadow-sm min-h-[400px]">
                <AnimatePresence mode="wait">
                  {viewMode === "code" ? (
                    <motion.div
                      key="code"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full"
                    >
                      <CodeBlock code={outputCode} placeholder={t.emptyState} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className="h-full p-4"
                    >
                      <PreviewPanel svgCode={previewCode} labels={t} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER BANNER */}
      <div className="bg-black text-white py-3 overflow-hidden">
        <div className="flex gap-8 animate-marquee whitespace-nowrap font-bold text-sm tracking-widest">
          {Array(10)
            .fill(t.marquee)
            .map((text, i) => (
              <span key={i} className="opacity-80">
                {text}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
