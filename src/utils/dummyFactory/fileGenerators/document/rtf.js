/**
 * RTF 파일 생성 함수
 * RTF는 텍스트 기반 형식이므로 직접 구현 가능
 */
import { convertMBToBytes } from "../utils";

/**
 * RTF 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 RTF Blob
 */
export const generateRTF = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // RTF 헤더
  const header = `{\\rtf1\\ansi\\deff0 {\\fonttbl {\\f0 Times New Roman;}}\\f0\\fs24 `;

  // RTF 푸터
  const footer = `}`;

  const headerSize = new TextEncoder().encode(header).length;
  const footerSize = new TextEncoder().encode(footer).length;
  const dataSize = byteSize - headerSize - footerSize;

  if (dataSize < 0) {
    return new Blob([header + footer], { type: "application/rtf" });
  }

  // RTF 콘텐츠 생성
  const paragraphsNeeded = Math.floor(dataSize / 100);
  let rtf = header;

  for (let i = 0; i < paragraphsNeeded; i++) {
    rtf += `\\par Dummy paragraph ${i + 1}. Content: ${"0".repeat(50)}`;
  }

  // 남은 공간 채우기
  const currentSize = new TextEncoder().encode(rtf).length;
  const remaining = byteSize - currentSize - footerSize;
  if (remaining > 0) {
    rtf += `\\par ${"0".repeat(remaining)}`;
  }

  rtf += footer;

  return new Blob([rtf], { type: "application/rtf" });
};

