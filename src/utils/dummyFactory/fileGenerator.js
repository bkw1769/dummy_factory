/**
 * 더미 파일 생성 유틸리티
 */
import { EXTENSION_MIME_TYPES } from "@/constants/dummyFactory/fileTypes";

/**
 * OS 감지 및 단위 변환 상수
 */
const BYTES_PER_MB_BINARY = 1024 * 1024; // 1,048,576 (Windows/Linux 표준)
const BYTES_PER_MB_DECIMAL = 1000 * 1000; // 1,000,000 (macOS 표준)

/**
 * 현재 OS가 macOS인지 감지
 * @returns {boolean} macOS 여부
 */
const isMacOS = () => {
  if (typeof navigator === "undefined") return false;
  const platform =
    navigator.platform || navigator.userAgentData?.platform || "";
  const userAgent = navigator.userAgent || "";

  return (
    platform.toUpperCase().indexOf("MAC") >= 0 ||
    /Mac|iPhone|iPad|iPod/.test(userAgent)
  );
};

/**
 * OS에 따른 MB를 바이트로 변환
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {number} 바이트 크기
 */
const convertMBToBytes = (sizeMB, unit = "auto") => {
  let bytesPerMB;

  if (unit === "binary") {
    bytesPerMB = BYTES_PER_MB_BINARY;
  } else if (unit === "decimal") {
    bytesPerMB = BYTES_PER_MB_DECIMAL;
  } else {
    // auto: OS에 따라 자동 선택
    bytesPerMB = isMacOS() ? BYTES_PER_MB_DECIMAL : BYTES_PER_MB_BINARY;
  }

  return Math.floor(sizeMB * bytesPerMB);
};

/**
 * 지정된 크기의 바이너리 데이터 생성 (정확한 크기 보장)
 * @param {number} byteSize - 생성할 바이트 크기
 * @returns {Uint8Array} 생성된 바이너리 데이터
 */
const createBinaryData = (byteSize) => {
  // ArrayBuffer를 사용하여 정확한 크기의 바이너리 데이터 생성
  // ArrayBuffer는 지정된 크기만큼만 할당되므로 정확한 크기 보장
  const buffer = new ArrayBuffer(byteSize);
  const view = new Uint8Array(buffer);

  // ArrayBuffer는 자동으로 0으로 초기화됨
  // 전체 크기는 정확히 byteSize로 유지됨

  return view;
};

/**
 * 더미 파일 Blob 생성 (정확한 크기 보장, OS별 자동 보정)
 * @param {string} ext - 파일 확장자 (예: ".png", ".mp4")
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto') - 기본값: 'auto' (OS 자동 감지)
 * @returns {Blob} 생성된 Blob 객체
 */
export const generateDummyBlob = (ext, sizeMB, unit = "auto") => {
  // OS에 따라 MB를 바이트로 변환 (macOS는 1000 기반, Windows/Linux는 1024 기반)
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 정확한 크기의 바이너리 데이터 생성
  const binaryData = createBinaryData(byteSize);

  // 확장자에 맞는 MIME 타입 가져오기 (기본값: application/octet-stream)
  const mimeType = EXTENSION_MIME_TYPES[ext] || "application/octet-stream";

  // MIME 타입을 지정하여 Blob 생성
  const blob = new Blob([binaryData], { type: mimeType });

  // 디버깅: 생성된 Blob 크기 확인 (개발 환경에서만)
  if (process.env.NODE_ENV === "development") {
    const actualSizeMB = (
      blob.size / (isMacOS() ? BYTES_PER_MB_DECIMAL : BYTES_PER_MB_BINARY)
    ).toFixed(2);
    const expectedSizeMB = sizeMB.toFixed(2);
    const detectedOS = isMacOS()
      ? "macOS (1000 기반)"
      : "Windows/Linux (1024 기반)";

    console.log(
      `File Generation Info:\n` +
        `  OS: ${detectedOS}\n` +
        `  Expected: ${expectedSizeMB}MB\n` +
        `  Actual: ${actualSizeMB}MB\n` +
        `  Bytes: ${blob.size.toLocaleString()} bytes`
    );

    if (Math.abs(blob.size - byteSize) > 0) {
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
