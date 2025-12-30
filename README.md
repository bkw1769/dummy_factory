# 🏭 Dummy Factory

더미 파일을 빠르게 생성하고 다운로드할 수 있는 웹 애플리케이션입니다.

## 🛠️ 제공 도구

| 도구 | 경로 | 설명 |
|------|------|------|
| **Dummy Factory** | `/dummy-factory` | 다양한 형식의 더미 파일 생성 |
| **SVG Laundry** | `/svg-laundry` | SVG 파일 최적화 및 정리 |

## ✨ 주요 기능

### Dummy Factory
- **50+ 파일 형식 지원**: 이미지, 비디오, 오디오, 문서, 데이터, 압축 파일
- **크기 조절**: 0MB ~ 1000MB까지 자유롭게 설정
- **형식별 최적화 생성**: 실제 파일 구조로 생성 (단순 바이너리 아님)
- **손상된 파일 생성**: 테스트용 corrupt 파일 생성 옵션
- **OS별 크기 단위**: macOS(1000 기반) / Windows(1024 기반) 자동 감지
- **인터랙티브 UI**: 3D 틸트 효과와 애니메이션
- **다국어 지원**: 한국어/영어 전환

### 지원 파일 형식

| 카테고리 | 확장자 |
|----------|--------|
| 이미지 | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`, `.bmp`, `.ico`, `.tiff` |
| 비디오 | `.mp4`, `.mov`, `.avi`, `.webm`, `.mkv`, `.wmv`, `.flv`, `.gifv` |
| 오디오 | `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`, `.aac`, `.wma` |
| 문서 | `.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.xls`, `.xlsx`, `.txt`, `.md`, `.rtf` |
| 데이터 | `.json`, `.csv`, `.xml`, `.sql`, `.yaml`, `.html`, `.css`, `.js` |
| 압축 | `.zip`, `.rar`, `.7z`, `.tar`, `.gz`, `.iso`, `.dmg` |

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)로 접속하세요.

### 빌드

```bash
# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 📁 프로젝트 구조

```
dummy_factory/
├── src/
│   ├── components/
│   │   ├── dummyFactory/         # Dummy Factory 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── FileTypeSelector.jsx
│   │   │   ├── FileCrafter.jsx
│   │   │   ├── FilePreview.jsx
│   │   │   ├── FileControls.jsx
│   │   │   ├── TiltCard.jsx
│   │   │   ├── ExtensionChip.jsx
│   │   │   ├── ConfettiParticle.jsx
│   │   │   └── ProTipCard.jsx
│   │   ├── svgLaundry/           # SVG Laundry 컴포넌트
│   │   │   ├── Header.jsx
│   │   │   ├── PreviewPanel.jsx
│   │   │   ├── CodeBlock.jsx
│   │   │   ├── ToggleOption.jsx
│   │   │   └── ViewToggle.jsx
│   │   └── AdSense.jsx           # 공통 광고 컴포넌트
│   ├── constants/
│   │   ├── dummyFactory/
│   │   │   ├── fileTypes.js      # 파일 카테고리 및 MIME 타입 정의
│   │   │   └── translations.js   # 다국어 번역
│   │   ├── svgLaundry/
│   │   │   └── translations.js
│   │   └── home/
│   │       └── translations.js
│   ├── utils/
│   │   ├── dummyFactory/
│   │   │   ├── fileGenerator.js  # 메인 파일 생성 로직
│   │   │   ├── sizeValidator.js  # 크기 검증 유틸리티
│   │   │   └── fileGenerators/   # 형식별 생성기
│   │   │       ├── index.js      # 모든 생성기 export
│   │   │       ├── utils.js      # 공통 유틸리티
│   │   │       ├── text/         # JSON, CSV, XML, HTML, TXT 등
│   │   │       ├── image/        # PNG, JPEG, GIF, WebP, SVG 등
│   │   │       ├── document/     # PDF, DOCX, PPTX, XLSX 등
│   │   │       ├── audio/        # WAV
│   │   │       └── archive/      # ZIP
│   │   └── svgLaundry/
│   │       └── svgProcessor.js
│   ├── pages/
│   │   ├── Home.jsx              # 홈 페이지 (/)
│   │   ├── DummyFactory.jsx      # 더미 파일 생성 (/dummy-factory)
│   │   └── SvgLaundry.jsx        # SVG 최적화 (/svg-laundry)
│   ├── App.jsx                   # 라우터 설정
│   ├── main.jsx
│   └── index.css
├── vite.config.js                # @ alias 설정 포함
├── tailwind.config.js
└── postcss.config.js
```

## 🎨 기술 스택

### 프레임워크 & 빌드
- **React 18** - UI 라이브러리
- **Vite 5** - 빌드 도구 (HMR, @ alias 설정)
- **React Router DOM** - 클라이언트 사이드 라우팅

### 스타일링 & UI
- **Tailwind CSS** - 유틸리티 퍼스트 스타일링
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘

### 파일 생성 라이브러리
- **pdf-lib** - PDF 문서 생성
- **docx** - DOCX 문서 생성
- **xlsx** - Excel 파일 생성
- **jszip** - ZIP 압축 파일 생성
- **pngjs** / **jpeg-js** - 이미지 생성
- **pako** - 압축 유틸리티

## 📝 코딩 규칙

### 파일 명명 규칙

- **컴포넌트**: PascalCase (예: `TiltCard.jsx`)
- **유틸리티**: camelCase (예: `fileGenerator.js`)
- **상수**: camelCase (예: `translations.js`)
- **페이지**: PascalCase (예: `DummyFactory.jsx`)

### 컴포넌트 구조

```jsx
/**
 * 컴포넌트 설명
 * @param {Object} props
 * @param {string} props.propName - 속성 설명
 */
export default function ComponentName({ propName }) {
  // 로직
  return (
    // JSX
  );
}
```

### Import 순서

1. React 및 라이브러리
2. 외부 컴포넌트
3. 내부 컴포넌트
4. 상수
5. 유틸리티
6. 스타일

### 상태 관리

- 간단한 상태는 `useState` 사용
- 복잡한 상태는 커스텀 훅으로 분리 고려

### 스타일링

- Tailwind CSS 클래스 우선 사용
- 인라인 스타일은 동적 값이 필요한 경우만 사용
- 재사용 가능한 스타일은 컴포넌트로 분리

## 🔧 개발 가이드

### Path Alias

Vite에서 `@` alias가 `./src`로 설정되어 있습니다:
```javascript
import Component from "@/components/dummyFactory/Header";
import { FILE_CATEGORIES } from "@/constants/dummyFactory/fileTypes";
```

### 새로운 파일 형식 생성기 추가

1. `src/utils/dummyFactory/fileGenerators/<category>/` 에 생성기 파일 생성
   ```javascript
   // 예: fileGenerators/image/newformat.js
   export const generateNEWFORMAT = (sizeMB, unit = "auto") => {
     // 파일 생성 로직
     return new Blob([data], { type: "image/newformat" });
   };
   ```
2. `fileGenerators/index.js`에서 export 추가
3. `fileGenerator.js`의 `generatorMap`에 매핑 추가
4. `constants/dummyFactory/fileTypes.js`에 확장자/MIME 타입 추가

### 새로운 도구(페이지) 추가

1. `src/pages/NewTool.jsx` 생성
2. `src/components/newTool/` 디렉토리에 컴포넌트 추가
3. `src/constants/newTool/translations.js` 생성
4. `App.jsx`에 라우트 추가

### 환경 변수

```bash
# .env (선택사항 - AdSense 광고용)
VITE_ADSENSE_SLOT_SIDEBAR=your_slot_id
VITE_ADSENSE_SLOT_FOOTER=your_slot_id
```

## 📄 라이선스

MIT

## 🤝 기여하기

이슈나 풀 리퀘스트를 환영합니다!

