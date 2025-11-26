# 🏭 Dummy Factory

더미 파일을 빠르게 생성하고 다운로드할 수 있는 웹 애플리케이션입니다.

## ✨ 주요 기능

- **다양한 파일 타입 지원**: JSON, PNG, JPG, MP4, PDF, CSV, MP3, TXT
- **크기 조절**: 0MB ~ 1000MB까지 자유롭게 설정 가능
- **인터랙티브 UI**: 3D 틸트 효과와 부드러운 애니메이션
- **다국어 지원**: 한국어/영어 전환 가능
- **시각적 피드백**: 파일 크기에 따른 아이콘 무게감 표현

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
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── TiltCard.jsx     # 3D 틸트 효과 카드
│   │   ├── ConfettiParticle.jsx  # 컨페티 파티클
│   │   ├── Header.jsx       # 헤더 컴포넌트
│   │   ├── FileTypeSelector.jsx  # 파일 타입 선택 영역
│   │   ├── FilePreview.jsx  # 파일 미리보기
│   │   ├── FileControls.jsx # 파일 생성 컨트롤
│   │   ├── FileCrafter.jsx  # 파일 제작 영역
│   │   └── ProTipCard.jsx   # 프로 팁 카드
│   ├── constants/           # 상수 정의
│   │   ├── translations.js  # 다국어 번역
│   │   └── fileTypes.js     # 파일 타입 정의
│   ├── utils/               # 유틸리티 함수
│   │   ├── fileGenerator.js # 파일 생성 로직
│   │   └── sizeValidator.js # 크기 검증 및 계산
│   ├── pages/               # 페이지 컴포넌트
│   │   └── DummyFactory.jsx # 메인 페이지
│   ├── App.jsx              # 루트 컴포넌트
│   ├── main.jsx             # 진입점
│   └── index.css            # 전역 스타일
├── public/                  # 정적 파일
├── index.html               # HTML 템플릿
├── package.json             # 프로젝트 설정
├── vite.config.js           # Vite 설정
├── tailwind.config.js       # Tailwind CSS 설정
└── postcss.config.js        # PostCSS 설정
```

## 🎨 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **Tailwind CSS** - 스타일링
- **Framer Motion** - 애니메이션
- **Lucide React** - 아이콘

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

### 새로운 파일 타입 추가

1. `src/constants/fileTypes.js`에 타입 추가
2. `src/constants/translations.js`에 번역 추가

### 새로운 언어 추가

1. `src/constants/translations.js`에 언어 객체 추가
2. 언어 전환 로직에 새 언어 추가

### 컴포넌트 추가

1. `src/components/` 디렉토리에 새 컴포넌트 파일 생성
2. 컴포넌트는 단일 책임 원칙을 따름
3. Props는 명확한 타입과 설명을 JSDoc으로 작성

## 📄 라이선스

MIT

## 🤝 기여하기

이슈나 풀 리퀘스트를 환영합니다!

