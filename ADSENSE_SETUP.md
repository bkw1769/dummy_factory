# 🚀 AdSense 설정 가이드

이 문서는 Dummy Factory 프로젝트에 Google AdSense를 설정하는 방법을 안내합니다.

## 📋 사전 준비사항

1. Google AdSense 계정 생성 및 승인
2. 사이트 등록 및 승인 완료
3. 광고 단위 생성 완료

---

## 🔧 설정 단계

### 1. 환경 변수 파일 생성

프로젝트 루트 디렉토리에 `.env` 파일을 생성하세요:

```bash
# 프로젝트 루트에서
touch .env
```

### 2. 환경 변수 설정

`.env` 파일에 다음 내용을 추가하세요:

```env
# Google AdSense 클라이언트 ID
# AdSense 대시보드 > 계정 > 광고 설정에서 확인
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXX

# 광고 슬롯 ID
# AdSense 대시보드 > 광고 > 광고 단위에서 각각 생성한 후 슬롯 ID 복사
VITE_ADSENSE_SLOT_HEADER=1234567890
VITE_ADSENSE_SLOT_SIDEBAR=0987654321
VITE_ADSENSE_SLOT_CONTENT=1122334455
VITE_ADSENSE_SLOT_FOOTER=5566778899
```

**중요**: 
- `ca-pub-XXXXXXXXXX`를 실제 AdSense 클라이언트 ID로 변경하세요
- 각 슬롯 ID를 실제 생성한 광고 단위의 ID로 변경하세요

### 3. 광고 단위 생성

AdSense 대시보드에서 다음 광고 단위를 생성하세요:

#### Header Ad (헤더 광고)
- **형식**: 반응형 디스플레이 광고
- **크기**: 자동 (728x90 데스크톱, 320x50 모바일)
- **위치**: 페이지 상단 헤더 하단

#### Sidebar Ad (사이드바 광고)
- **형식**: 배간 광고 (Medium Rectangle)
- **크기**: 300x250
- **위치**: 메인 콘텐츠 옆 (데스크톱 전용)

#### Footer Ad (하단 광고)
- **형식**: 반응형 디스플레이 광고
- **크기**: 자동
- **위치**: 페이지 하단

### 4. 개발 환경에서 테스트

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 확인:
- 환경 변수가 설정되지 않으면 광고가 표시되지 않습니다 (정상)
- `.env` 파일에 올바른 값이 있으면 광고가 표시됩니다

### 5. 프로덕션 배포

배포 플랫폼에 따라 환경 변수를 설정하세요:

#### Vercel
1. 프로젝트 설정 > Environment Variables
2. 각 변수 추가:
   - `VITE_ADSENSE_CLIENT_ID`
   - `VITE_ADSENSE_SLOT_HEADER`
   - `VITE_ADSENSE_SLOT_SIDEBAR`
   - `VITE_ADSENSE_SLOT_FOOTER`

#### Netlify
1. Site settings > Build & deploy > Environment
2. 각 변수 추가

#### 기타 플랫폼
각 플랫폼의 환경 변수 설정 방법에 따라 `VITE_` 접두사가 붙은 변수들을 설정하세요.

---

## 📍 광고 배치 위치

현재 구현된 광고 위치:

1. **Header Ad** (`src/components/Header.jsx`)
   - 헤더 컴포넌트 하단
   - 반응형 디스플레이 광고

2. **Sidebar Ad** (`src/pages/DummyFactory.jsx`)
   - 메인 콘텐츠 그리드 옆
   - 데스크톱 전용 (lg 이상)
   - Sticky 포지션으로 스크롤 시 고정

3. **Footer Ad** (`src/pages/DummyFactory.jsx`)
   - ProTipCard 하단
   - 페이지 하단

---

## 🧪 테스트 방법

### 로컬 개발 환경

1. `.env` 파일에 테스트용 값 설정 (실제 AdSense ID 사용)
2. 개발 서버 실행: `npm run dev`
3. 브라우저에서 광고 표시 확인
4. AdSense 대시보드에서 노출 확인

### 프로덕션 환경

1. 환경 변수 설정 완료
2. 배포
3. 실제 사이트에서 광고 표시 확인
4. AdSense 대시보드에서 실시간 데이터 확인

---

## ⚠️ 주의사항

### AdSense 정책 준수

1. **클릭 유도 금지**: 사용자에게 광고 클릭을 유도하지 마세요
2. **과도한 광고 금지**: 페이지당 3-4개 이하 권장
3. **콘텐츠 가림 금지**: 주요 기능을 가리지 마세요
4. **자동 재생 비디오 금지**: 소음/데이터 사용 이슈

### 성능 최적화

- AdSense 스크립트는 페이지 로드 1초 후 로드됩니다
- 광고가 없으면 컴포넌트가 렌더링되지 않습니다
- 환경 변수가 없으면 광고가 표시되지 않습니다 (에러 없음)

---

## 🔍 문제 해결

### 광고가 표시되지 않는 경우

1. **환경 변수 확인**
   ```bash
   # 개발 환경에서 확인
   console.log(import.meta.env.VITE_ADSENSE_CLIENT_ID)
   ```

2. **AdSense 스크립트 로드 확인**
   - 브라우저 개발자 도구 > Network 탭
   - `adsbygoogle.js` 파일 로드 확인

3. **AdSense 계정 상태 확인**
   - AdSense 대시보드에서 계정 상태 확인
   - 사이트 승인 완료 여부 확인

4. **광고 차단기 확인**
   - 브라우저 광고 차단기 비활성화
   - 테스트 모드에서 확인

### 콘솔 에러 확인

브라우저 개발자 도구 콘솔에서 다음 에러 확인:
- `AdSense error`: AdSense 컴포넌트 에러
- 스크립트 로드 실패: 네트워크 문제 또는 차단

---

## 📊 성과 모니터링

### AdSense 대시보드에서 확인할 지표

1. **페이지뷰**: 총 페이지 조회수
2. **노출수**: 광고 노출 횟수
3. **클릭수**: 광고 클릭 횟수
4. **CTR**: 클릭률 (클릭수/노출수)
5. **RPM**: 1000회 노출당 수익

### 최적화 팁

- 광고 위치별 성과 비교
- A/B 테스트로 최적 위치 찾기
- 사용자 피드백 수집
- 성능 모니터링 (PageSpeed Insights)

---

## 📞 문의

설정 중 문제가 발생하면:
- 이메일: bkw991105@gmail.com
- GitHub Issues: 프로젝트 저장소에 이슈 생성

---

**마지막 업데이트**: 2024년 11월

