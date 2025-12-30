/**
 * MOV (QuickTime) 비디오 파일 생성 함수
 * MP4와 동일한 ISO BMFF 구조, ftyp만 QuickTime으로 변경
 */
import { generateMP4 } from "./mp4";

/**
 * MOV 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 MOV Blob
 */
export const generateMOV = (sizeMB, unit = "auto") => {
  return generateMP4(sizeMB, unit, "qt  ");
};
