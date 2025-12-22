/**
 * SVG 이미지 파일 생성 함수
 * SVG는 XML 기반이므로 텍스트로 생성 가능
 */
import { convertMBToBytes } from "../utils";

/**
 * SVG 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 SVG Blob
 */
export const generateSVG = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  const header = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="#f0f0f0"/>
  <g>`;

  const footer = `  </g>
</svg>`;

  const headerSize = new TextEncoder().encode(header).length;
  const footerSize = new TextEncoder().encode(footer).length;
  const dataSize = byteSize - headerSize - footerSize;

  if (dataSize < 0) {
    return new Blob([header + footer], { type: "image/svg+xml" });
  }

  // SVG 요소로 데이터 채우기
  const elementSize = new TextEncoder().encode(
    '<circle cx="128" cy="128" r="10" fill="#000"/>'
  ).length;
  const elementsNeeded = Math.floor(dataSize / elementSize);

  let svg = header;
  for (let i = 0; i < elementsNeeded; i++) {
    const x = (i * 10) % 256;
    const y = Math.floor((i * 10) / 256) % 256;
    svg += `\n    <circle cx="${x}" cy="${y}" r="5" fill="#${((i * 7) % 256).toString(16).padStart(2, '0')}${((i * 11) % 256).toString(16).padStart(2, '0')}${((i * 13) % 256).toString(16).padStart(2, '0')}"/>`;
  }

  // 남은 공간 채우기
  const currentSize = new TextEncoder().encode(svg).length;
  const remaining = byteSize - currentSize - footerSize;
  if (remaining > 0) {
    svg += `\n    <!-- ${"0".repeat(remaining - 7)} -->`;
  }

  svg += footer;

  return new Blob([svg], { type: "image/svg+xml" });
};

