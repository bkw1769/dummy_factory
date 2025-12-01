import TiltCard from "@/components/dummyFactory/TiltCard";
import { FILE_CATEGORIES } from "@/constants/fileTypes";

/**
 * 파일 카테고리 선택 영역 컴포넌트
 * @param {Object} props
 * @param {Object} props.selectedCategory - 현재 선택된 카테고리
 * @param {Function} props.onSelectCategory - 카테고리 선택 핸들러
 * @param {string} props.lang - 현재 언어
 */
export default function FileTypeSelector({
  selectedCategory,
  onSelectCategory,
  lang,
}) {
  return (
    <div className="lg:col-span-7">
      <div className="bg-white/40 backdrop-blur-sm p-6 rounded-[2rem] border-4 border-black/5 shadow-inner h-full">
        <div className="flex items-center gap-2 mb-6">
          <span className="bg-pink-400 text-black px-3 py-1 rounded-full font-bold text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            {lang === "ko" ? "1단계" : "STEP 1"}
          </span>
          <h2 className="text-xl font-bold">
            {lang === "ko" ? "카테고리 선택" : "Pick a Category"}
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FILE_CATEGORIES.map((cat) => (
            <TiltCard
              key={cat.id}
              data={cat}
              isSelected={selectedCategory.id === cat.id}
              onClick={() => onSelectCategory(cat)}
              lang={lang}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
