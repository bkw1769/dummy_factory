/**
 * 더미 파일 생성 유틸리티
 */
import { EXTENSION_MIME_TYPES } from "@/constants/dummyFactory/fileTypes";
import {
  generateJSON,
  generateCSV,
  generateXML,
  generateHTML,
  generateTXT,
  generateMD,
  generateCSS,
  generateJS,
  generateYAML,
  generateSQL,
  generateWAV,
  generatePNG,
  generateJPEG,
  generateGIF,
  generateWebP,
  generateSVG,
  generateBMP,
  generateICO,
  generateTIFF,
  generatePDF,
  generateDOC,
  generateDOCX,
  generatePPT,
  generatePPTX,
  generateXLS,
  generateXLSX,
  generateRTF,
  generateZIP,
  generateTAR,
  generateGZ,
  generateAVI,
  generateMP4,
  generateMOV,
  generateWebM,
  generateMKV,
  generateGIFV,
  generateOGG,
  generateFLAC,
  generateM4A,
} from "./fileGenerators";
import { convertMBToBytes, isMacOS, createBinaryData } from "./fileGenerators/utils";

/**
 * OS 감지 및 단위 변환 상수
 */
const BYTES_PER_MB_BINARY = 1024 * 1024; // 1,048,576 (Windows/Linux 표준)
const BYTES_PER_MB_DECIMAL = 1000 * 1000; // 1,000,000 (macOS 표준)

/**
 * 기본 바이너리 Blob 생성 (지원되지 않는 형식용)
 * @param {string} ext - 파일 확장자
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 Blob 객체
 */
const generateBinaryBlob = (ext, sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const binaryData = createBinaryData(byteSize);
  const mimeType = EXTENSION_MIME_TYPES[ext] || "application/octet-stream";
  return new Blob([binaryData], { type: mimeType });
};

/**
 * 파일 형식별 생성 함수 매핑
 */
const generatorMap = {
  // 텍스트 기반 파일
  ".json": generateJSON,
  ".csv": generateCSV,
  ".xml": generateXML,
  ".html": generateHTML,
  ".txt": generateTXT,
  ".md": generateMD,
  ".css": generateCSS,
  ".js": generateJS,
  ".yaml": generateYAML,
  ".sql": generateSQL,
  // 이미지 파일
  ".png": generatePNG,
  ".jpg": generateJPEG,
  ".jpeg": generateJPEG,
  ".gif": generateGIF,
  ".webp": generateWebP,
  ".svg": generateSVG,
  ".bmp": generateBMP,
  ".ico": generateICO,
  ".tiff": generateTIFF,
  // 문서 파일
  ".pdf": generatePDF,
  ".doc": generateDOC,
  ".docx": generateDOCX,
  ".ppt": generatePPT,
  ".pptx": generatePPTX,
  ".xls": generateXLS,
  ".xlsx": generateXLSX,
  ".rtf": generateRTF,
  // 오디오 파일
  ".wav": generateWAV,
  ".ogg": generateOGG,
  ".flac": generateFLAC,
  ".m4a": generateM4A,
  // 비디오 파일
  ".mp4": generateMP4,
  ".mov": generateMOV,
  ".avi": generateAVI,
  ".webm": generateWebM,
  ".mkv": generateMKV,
  ".gifv": generateGIFV,
  // 압축 파일
  ".zip": generateZIP,
  ".tar": generateTAR,
  ".gz": generateGZ,
};

/**
 * 더미 파일 Blob 생성 (파일 형식별 최적화된 생성)
 * @param {string} ext - 파일 확장자 (예: ".png", ".mp4")
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto') - 기본값: 'auto' (OS 자동 감지)
 * @param {boolean} isBroken - 깨진 파일 생성 여부 - 기본값: false
 * @returns {Promise<Blob>} 생성된 Blob 객체 (ZIP의 경우 Promise)
 */
export const generateDummyBlob = async (
  ext,
  sizeMB,
  unit = "auto",
  isBroken = false
) => {
  // 깨진 파일인 경우 corrupt 헤더 추가
  if (isBroken) {
    const byteSize = convertMBToBytes(sizeMB, unit);
    const corruptHeader = "CORRUPT_FILE_HEADER_ERROR_X892_MALFORMED_DATA...";
    const headerSize = new TextEncoder().encode(corruptHeader).length;
    const dataSize = byteSize - headerSize;

    if (dataSize < 0) {
      const content = corruptHeader;
      return new Blob([content], { type: "application/octet-stream" });
    }

    const content = corruptHeader + "1".repeat(dataSize);
    return new Blob([content], { type: "application/octet-stream" });
  }

  const normalizedExt = ext.toLowerCase();
  const generator = generatorMap[normalizedExt];

  let blob;

  if (generator) {
    // 형식별 생성 함수 사용
    try {
      const result = generator(sizeMB, unit);
      // ZIP은 Promise를 반환하므로 await 처리
      blob = result instanceof Promise ? await result : result;
    } catch (error) {
      console.error(`Error generating ${normalizedExt} file:`, error);
      // 에러 발생 시 기본 바이너리 생성으로 폴백
      blob = generateBinaryBlob(ext, sizeMB, unit);
    }
  } else {
    // 지원되지 않는 형식은 기본 바이너리 생성
    blob = generateBinaryBlob(ext, sizeMB, unit);
  }

  // 디버깅: 생성된 Blob 크기 확인 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    const actualSizeMB = (
      blob.size / (isMacOS() ? BYTES_PER_MB_DECIMAL : BYTES_PER_MB_BINARY)
    ).toFixed(2);
    const expectedSizeMB = sizeMB.toFixed(2);
    const detectedOS = isMacOS()
      ? "macOS (1000 기반)"
      : "Windows/Linux (1024 기반)";
    const generatorType = generator ? "format-specific" : "binary";

    console.log(
      `File Generation Info:\n` +
        `  Format: ${normalizedExt}\n` +
        `  Generator: ${generatorType}\n` +
        `  OS: ${detectedOS}\n` +
        `  Expected: ${expectedSizeMB}MB\n` +
        `  Actual: ${actualSizeMB}MB\n` +
        `  Bytes: ${blob.size.toLocaleString()} bytes`
    );

    const byteSize = convertMBToBytes(sizeMB, unit);
    if (Math.abs(blob.size - byteSize) > 1000) {
      // 1KB 이상 차이나면 경고
      console.warn(
        `Size mismatch: Expected ${expectedSizeMB}MB (${byteSize} bytes), Got ${actualSizeMB}MB (${blob.size} bytes)`
      );
    }
  }

  return blob;
};

/**
 * 파일 다운로드 실행
 * @param {Blob} blob - 다운로드할 Blob 객체
 * @param {string} filename - 파일명
 */
export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
