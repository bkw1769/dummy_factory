/**
 * 파일 생성 유틸리티 함수
 */

/**
 * OS 감지 및 단위 변환 상수
 */
const BYTES_PER_MB_BINARY = 1024 * 1024; // 1,048,576 (Windows/Linux 표준)
const BYTES_PER_MB_DECIMAL = 1000 * 1000; // 1,000,000 (macOS 표준)

/**
 * 현재 OS가 macOS인지 감지
 * @returns {boolean} macOS 여부
 */
export const isMacOS = () => {
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
export const convertMBToBytes = (sizeMB, unit = "auto") => {
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
export const createBinaryData = (byteSize) => {
  const buffer = new ArrayBuffer(byteSize);
  const view = new Uint8Array(buffer);
  return view;
};

