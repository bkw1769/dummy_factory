/**
 * 파일 크기 검증 유틸리티
 */

const MIN_SIZE_MB = 0;
const MAX_SIZE_MB = 1000; // 최대 크기를 1000MB(1GB)로 증가

/**
 * 파일 크기 값을 검증하고 제한된 범위로 조정
 * @param {number|string} value - 검증할 크기 값
 * @returns {number} 검증된 크기 값 (0-1000 사이)
 */
export const validateSize = (value) => {
  let newSize = Number(value);
  if (isNaN(newSize) || newSize < MIN_SIZE_MB) newSize = MIN_SIZE_MB;
  if (newSize > MAX_SIZE_MB) newSize = MAX_SIZE_MB;
  return newSize;
};

/**
 * 파일 크기에 따른 시각적 피드백 값 계산
 * @param {number} sizeMB - 파일 크기 (MB)
 * @returns {Object} heavyY, textY 값
 */
export const calculateVisualFeedback = (sizeMB) => {
  const heavyY = Math.min(sizeMB / 20, 30); // 최대 30px 하강
  const textY = heavyY + (sizeMB / 2000) * 45; // 텍스트 위치 보정
  return { heavyY, textY };
};
