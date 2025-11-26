# 프로젝트 구조 상세 설명

## 📂 디렉토리 구조

```
dummy_factory/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── TiltCard.jsx     # 3D 틸트 효과가 있는 파일 타입 카드
│   │   ├── ConfettiParticle.jsx  # 다운로드 시 표시되는 컨페티 파티클
│   │   ├── Header.jsx       # 애플리케이션 헤더 (로고, 언어 전환, 저장소 링크)
│   │   ├── FileTypeSelector.jsx  # 파일 타입 선택 영역
│   │   ├── FilePreview.jsx  # 선택된 파일 타입 미리보기
│   │   ├── FileControls.jsx # 파일 크기, 이름 입력 및 생성 버튼
│   │   ├── FileCrafter.jsx  # 파일 제작 영역 (Preview + Controls 통합)
│   │   └── ProTipCard.jsx   # 프로 팁 카드
│   ├── constants/           # 상수 정의
│   │   ├── translations.js  # 다국어 번역 객체 (한국어/영어)
│   │   └── fileTypes.js     # 지원하는 파일 타입 정의
│   ├── utils/              # 유틸리티 함수
│   │   ├── fileGenerator.js # 더미 파일 Blob 생성 및 다운로드 함수
│   │   └── sizeValidator.js # 파일 크기 검증 및 시각적 피드백 계산
│   ├── pages/              # 페이지 컴포넌트
│   │   └── DummyFactory.jsx # 메인 페이지 컴포넌트
│   ├── hooks/              # 커스텀 React 훅 (향후 확장용)
│   ├── App.jsx             # 루트 컴포넌트
│   ├── main.jsx            # 애플리케이션 진입점
│   └── index.css           # 전역 스타일 (Tailwind CSS 포함)
├── public/                 # 정적 파일
├── index.html              # HTML 템플릿
├── package.json            # 프로젝트 설정 및 의존성
├── vite.config.js          # Vite 빌드 설정
├── tailwind.config.js      # Tailwind CSS 설정
├── postcss.config.js       # PostCSS 설정
├── README.md               # 프로젝트 설명서
├── PROJECT_STRUCTURE.md    # 이 파일
└── .cursorrules            # Cursor IDE 코딩 규칙
```

## 🔄 데이터 흐름

```
User Input
    ↓
DummyFactory (pages)
    ↓
├── FileTypeSelector → FILE_TYPES (constants)
├── FileControls → validateSize (utils) → sizeValidator
├── FilePreview → calculateVisualFeedback (utils) → sizeValidator
└── handleDownload → generateDummyBlob (utils) → downloadFile (utils)
```

## 📦 컴포넌트 계층 구조

```
App
└── DummyFactory (pages)
    ├── Header
    ├── FileTypeSelector
    │   └── TiltCard (×8)
    ├── FileCrafter
    │   ├── FilePreview
    │   └── FileControls
    │       └── ConfettiParticle (×20)
    └── ProTipCard
```

## 🎯 주요 파일 설명

### 컴포넌트

- **TiltCard**: 마우스 움직임에 따라 3D 틸트 효과를 보여주는 파일 타입 선택 카드
- **ConfettiParticle**: 다운로드 성공 시 표시되는 애니메이션 파티클
- **Header**: 앱 상단 헤더, 언어 전환 및 저장소 링크 포함
- **FileTypeSelector**: 8가지 파일 타입을 선택할 수 있는 그리드 레이아웃
- **FilePreview**: 선택된 파일 타입의 아이콘과 크기를 시각적으로 표시
- **FileControls**: 파일 크기 슬라이더, 파일명 입력, 생성 버튼
- **FileCrafter**: FilePreview와 FileControls를 통합한 컨테이너
- **ProTipCard**: 사용자에게 유용한 팁을 제공하는 카드

### 상수

- **translations.js**: 한국어/영어 번역 객체
- **fileTypes.js**: 지원하는 파일 타입 배열 (id, ext, icon, color 포함)

### 유틸리티

- **fileGenerator.js**: 
  - `generateDummyBlob`: 지정된 크기의 더미 파일 Blob 생성
  - `downloadFile`: Blob을 파일로 다운로드
  
- **sizeValidator.js**:
  - `validateSize`: 파일 크기 값을 0-1000MB 범위로 검증
  - `calculateVisualFeedback`: 크기에 따른 시각적 피드백 값 계산

## 🔧 확장 가이드

### 새로운 파일 타입 추가

1. `src/constants/fileTypes.js`에 새 타입 추가:
```javascript
{ id: "zip", ext: ".zip", icon: FileArchive, color: "bg-gray-400" }
```

2. `src/constants/translations.js`에 번역 추가:
```javascript
types: {
  // ... 기존 타입들
  zip: "ZIP Archive", // 영어
  zip: "ZIP 압축파일", // 한국어
}
```

### 새로운 언어 추가

1. `src/constants/translations.js`에 새 언어 객체 추가
2. `src/pages/DummyFactory.jsx`의 언어 전환 로직 수정

### 새로운 컴포넌트 추가

1. `src/components/` 디렉토리에 새 컴포넌트 파일 생성
2. JSDoc으로 Props 문서화
3. 단일 책임 원칙 준수

## 📝 네이밍 컨벤션

- **컴포넌트**: PascalCase (`TiltCard.jsx`)
- **함수**: camelCase (`generateDummyBlob`)
- **상수**: UPPER_SNAKE_CASE (전역 상수) 또는 camelCase (파일 내 상수)
- **변수**: camelCase (`selectedType`, `sizeMB`)
- **Props**: camelCase (`isSelected`, `onClick`)

## 🎨 스타일링 규칙

- Tailwind CSS 클래스 우선 사용
- 동적 스타일은 `style` prop 사용
- 재사용 가능한 스타일은 컴포넌트로 분리
- 색상은 Tailwind 기본 색상 팔레트 사용

