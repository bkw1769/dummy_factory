/**
 * XML 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";

/**
 * XML 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 XML Blob
 */
export const generateXML = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
  const footer = "</root>";

  const headerSize = new TextEncoder().encode(header).length;
  const footerSize = new TextEncoder().encode(footer).length;
  const dataSize = byteSize - headerSize - footerSize;

  if (dataSize < 0) {
    return new Blob([header + footer], { type: "application/xml" });
  }

  // 데이터 영역을 XML 요소로 채우기
  const elementTemplate = `<data>`;
  const elementCloseTemplate = `</data>\n`;
  const elementSize =
    new TextEncoder().encode(elementTemplate + elementCloseTemplate).length;

  const elementsNeeded = Math.floor(dataSize / (elementSize + 100));
  let xml = header;

  for (let i = 0; i < elementsNeeded; i++) {
    xml += `<data>${"0".repeat(100)}</data>\n`;
  }

  // 남은 공간 채우기
  const currentSize = new TextEncoder().encode(xml).length;
  const remaining = byteSize - currentSize - footerSize;
  if (remaining > 0) {
    xml += `<data>${"0".repeat(remaining)}</data>\n`;
  }

  xml += footer;

  return new Blob([xml], { type: "application/xml" });
};

