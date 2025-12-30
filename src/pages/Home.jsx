import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Box, Shirt, ArrowRight, Globe } from "lucide-react";
import { TRANSLATIONS } from "@/constants/home/translations";

/**
 * 홈 페이지 컴포넌트
 * 도구 목록을 보여주고 각 도구로 이동할 수 있는 메인 페이지
 */
export default function Home() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("en"); // 기본값: 영어
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200 rounded-full blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-200 rounded-full blur-[100px] opacity-40"></div>
      </div>

      <div className="max-w-4xl w-full z-10">
        {/* Language Toggle */}
        <div className="absolute top-6 right-6 z-20">
          <button
            onClick={() => setLang((l) => (l === "en" ? "ko" : "en"))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold border-2 border-transparent hover:bg-white/80 transition-all active:scale-95 bg-white/50 backdrop-blur-sm"
          >
            <Globe size={18} />
            <span className="text-sm">{lang === "en" ? "KOR" : "ENG"}</span>
          </button>
        </div>

        <div className="text-center mb-12">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-block bg-black text-white px-4 py-1 rounded-full font-bold text-sm mb-4 border-2 border-transparent"
          >
            {t.badge}
          </motion.div>
          <motion.h1
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-5xl md:text-6xl font-black tracking-tight mb-4"
          >
            {t.title}
            <br />
            {t.titleSub}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-500 font-bold text-lg"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CARD 1: DUMMY FACTORY */}
          <motion.button
            onClick={() => navigate("/dummy-factory")}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-[#FFFBEB] rounded-[2rem] border-4 border-black p-8 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <div className="absolute top-4 right-4 bg-yellow-400 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center group-hover:rotate-12 transition-transform">
              <Box size={24} className="text-black" />
            </div>
            <div className="mt-4 mb-6">
              <span className="bg-orange-200 text-orange-800 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">
                {t.dummyFactory.category}
              </span>
              <h2 className="text-3xl font-black mt-3 leading-tight">
                {t.dummyFactory.title}
                <br />
                {t.dummyFactory.titleSub}
              </h2>
            </div>
            <p className="font-bold text-gray-500 mb-8">
              {t.dummyFactory.description}
              <br />
              {t.dummyFactory.descriptionSub}
            </p>
            <div className="flex items-center gap-2 font-black underline decoration-2 underline-offset-4 group-hover:text-orange-600">
              {t.dummyFactory.button} <ArrowRight size={20} />
            </div>
          </motion.button>

          {/* CARD 2: SVG LAUNDRY */}
          <motion.button
            onClick={() => navigate("/svg-laundry")}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-cyan-50 rounded-[2rem] border-4 border-black p-8 text-left shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <div className="absolute top-4 right-4 bg-cyan-400 w-12 h-12 rounded-full border-2 border-black flex items-center justify-center group-hover:-rotate-12 transition-transform">
              <Shirt size={24} className="text-black" />
            </div>
            <div className="mt-4 mb-6">
              <span className="bg-blue-200 text-blue-800 px-3 py-1 rounded-lg font-bold text-xs uppercase tracking-wider">
                {t.svgLaundry.category}
              </span>
              <h2 className="text-3xl font-black mt-3 leading-tight">
                {t.svgLaundry.title}
                <br />
                {t.svgLaundry.titleSub}
              </h2>
            </div>
            <p className="font-bold text-gray-500 mb-8">
              {t.svgLaundry.description}
              <br />
              {t.svgLaundry.descriptionSub}
            </p>
            <div className="flex items-center gap-2 font-black underline decoration-2 underline-offset-4 group-hover:text-blue-600">
              {t.svgLaundry.button} <ArrowRight size={20} />
            </div>
          </motion.button>
        </div>

        <footer className="mt-16 text-center">
          <div className="text-gray-400 font-bold text-sm mb-4">{t.footer}</div>
          <a
            href="https://github.com/bkw1769"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black font-bold underline decoration-2 underline-offset-4 transition-colors"
          >
            {lang === "ko" ? "개발자 깃허브" : "Developer Github"}
            <ArrowRight size={16} />
          </a>
        </footer>
      </div>
    </div>
  );
}
