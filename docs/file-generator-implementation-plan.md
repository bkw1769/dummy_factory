# 파일 생성기 구현 계획서

## 개요

현재 미구현된 파일 형식 중 **브라우저에서 간단히 구현 가능한 형식**만 정리합니다.

## 현재 구현 현황

| 카테고리 | 구현 완료 | 미구현 (바이너리 폴백) |
|----------|-----------|------------------------|
| 이미지 | PNG, JPG, GIF, WebP, SVG, BMP, ICO, TIFF | - |
| 문서 | PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, RTF | - |
| 데이터 | JSON, CSV, XML, HTML, TXT, MD, CSS, JS, YAML, SQL | - |
| 오디오 | WAV | MP3, OGG, M4A, FLAC, AAC, WMA |
| 비디오 | - | MP4, MOV, AVI, WebM, MKV, WMV, FLV |
| 압축 | ZIP | RAR, 7Z, TAR, GZ, ISO, DMG |

---

## 구현 가능한 형식

### 1. 비디오 카테고리

#### AVI (구현 난이도: ⭐ 쉬움)

**이유**: RIFF 구조로 WAV와 동일한 패턴

```
RIFF "AVI "
├── LIST "hdrl" (헤더)
│   ├── avih (메인 헤더)
│   └── LIST "strl" (스트림)
│       ├── strh (스트림 헤더)
│       └── strf (스트림 포맷)
└── LIST "movi" (데이터) ← 패딩으로 크기 조절
```

**구현 방법**:
```javascript
// wav.js와 유사한 패턴
const aviHeader = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, // "RIFF"
  ...fileSizeBytes,
  0x41, 0x56, 0x49, 0x20, // "AVI "
  // ... hdrl, strl 청크
]);
// movi 청크에 패딩 데이터 추가
```

#### MP4 (구현 난이도: ⭐⭐ 보통)

**이유**: Box 구조가 명확하고 최소 유효 파일 생성 가능

```
ftyp (파일 타입)
moov (메타데이터)
mdat (데이터) ← 패딩으로 크기 조절
```

**구현 방법**:
```javascript
// 최소 유효 MP4 구조
const ftyp = createBox('ftyp', [
  'isom',  // major brand
  0x00, 0x00, 0x02, 0x00,  // minor version
  'isom', 'iso2', 'mp41'   // compatible brands
]);
const moov = createMinimalMoov();
const mdat = createBox('mdat', paddingData);
```

#### MOV (구현 난이도: ⭐ 쉬움)

**이유**: MP4와 동일 구조, ftyp만 `qt  `로 변경

---

### 2. 압축 카테고리

#### TAR (구현 난이도: ⭐ 쉬움)

**이유**: 헤더만 있는 단순 아카이브 형식, 압축 없음

```
┌─────────────────────────┐
│ 헤더 (512 bytes)        │ ← 파일명, 크기, 권한 등
├─────────────────────────┤
│ 파일 데이터             │
│ (512 byte 단위 패딩)    │
├─────────────────────────┤
│ 다음 파일 헤더...       │
└─────────────────────────┘
│ EOF (1024 bytes 0x00)   │
```

**구현 방법**:
```javascript
// 512바이트 헤더 생성
const header = new Uint8Array(512);
// 파일명 (0-99)
header.set(stringToBytes('dummy.bin'), 0);
// 파일 모드 (100-107)
header.set(stringToBytes('0000644 '), 100);
// ... 나머지 헤더 필드
// 체크섬 계산 후 설정
```

#### GZ (구현 난이도: ⭐⭐ 보통)

**이유**: pako 라이브러리가 이미 설치되어 있음

```
┌─────────────────────────┐
│ 헤더 (10 bytes)         │
│ - Magic: 1f 8b          │
│ - Method: 08 (deflate)  │
│ - Flags, Time, OS       │
├─────────────────────────┤
│ DEFLATE 압축 데이터     │ ← pako.deflate() 사용
├─────────────────────────┤
│ CRC32 (4 bytes)         │
│ 원본 크기 (4 bytes)     │
└─────────────────────────┘
```

**구현 방법**:
```javascript
import pako from 'pako';

const gzHeader = new Uint8Array([
  0x1f, 0x8b,  // magic
  0x08,        // deflate
  0x00,        // flags
  0x00, 0x00, 0x00, 0x00,  // mtime
  0x00,        // extra flags
  0xff         // OS (unknown)
]);
const compressed = pako.deflate(data);
const crc = crc32(data);
```

---

### 3. 오디오 카테고리

#### OGG (구현 난이도: ⭐⭐ 보통)

**이유**: 오픈 컨테이너 형식, 페이지 구조가 단순

```
┌─────────────────────────┐
│ OggS 페이지 헤더        │
│ - "OggS" magic          │
│ - 스트림 정보           │
├─────────────────────────┤
│ 세그먼트 테이블         │
├─────────────────────────┤
│ 페이지 데이터           │ ← Vorbis ID 헤더
└─────────────────────────┘
```

**구현 방법**:
```javascript
const oggPage = new Uint8Array([
  0x4f, 0x67, 0x67, 0x53,  // "OggS"
  0x00,        // version
  0x02,        // header type (BOS)
  // ... granule position, serial, page sequence, checksum
]);
// Vorbis identification header 추가
```

---

## 구현 불가/어려운 형식

| 형식 | 이유 |
|------|------|
| MP3 | 프레임 인코딩 필요 (MPEG Layer 3) |
| FLAC | 복잡한 압축 알고리즘 |
| AAC | 라이센스 및 인코딩 복잡성 |
| M4A | AAC 인코딩 필요 |
| WMA | MS 독점 형식 |
| WebM | VP8/VP9 코덱 인코딩 필요 |
| MKV | EBML 구조 복잡 |
| WMV | ASF 컨테이너 복잡 |
| FLV | Adobe 형식, 레거시 |
| RAR | 독점 알고리즘 |
| 7Z | LZMA 압축 복잡 |
| ISO | 파일시스템 구조 |
| DMG | Apple 독점 형식 |

---

## 구현 우선순위

| 순위 | 형식 | 난이도 | 예상 작업량 | 비고 |
|------|------|--------|-------------|------|
| 1 | AVI | ⭐ | 50줄 | WAV 패턴 재사용 |
| 2 | TAR | ⭐ | 60줄 | 순수 구현 |
| 3 | MP4 | ⭐⭐ | 150줄 | Box 구조 이해 필요 |
| 4 | MOV | ⭐ | 10줄 | MP4 재사용 |
| 5 | GZ | ⭐⭐ | 40줄 | pako 활용 |
| 6 | OGG | ⭐⭐ | 80줄 | 페이지 구조 |

---

## 파일 구조

```
src/utils/dummyFactory/fileGenerators/
├── video/
│   ├── index.js
│   ├── avi.js      # 1순위
│   ├── mp4.js      # 3순위
│   └── mov.js      # 4순위 (mp4 import)
├── audio/
│   ├── index.js
│   ├── wav.js      # 기존
│   └── ogg.js      # 6순위
└── archive/
    ├── index.js
    ├── zip.js      # 기존
    ├── tar.js      # 2순위
    └── gz.js       # 5순위
```

---

## 수정 필요 파일

### 신규 생성
- [ ] `fileGenerators/video/index.js`
- [ ] `fileGenerators/video/avi.js`
- [ ] `fileGenerators/video/mp4.js`
- [ ] `fileGenerators/video/mov.js`
- [ ] `fileGenerators/audio/index.js`
- [ ] `fileGenerators/audio/ogg.js`
- [ ] `fileGenerators/archive/index.js`
- [ ] `fileGenerators/archive/tar.js`
- [ ] `fileGenerators/archive/gz.js`

### 수정
- [ ] `fileGenerators/index.js` - 새 생성기 export 추가
- [ ] `fileGenerator.js` - generatorMap에 매핑 추가
