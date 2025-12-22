/**
 * CSV 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";

/**
 * CSV 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 CSV Blob
 */
export const generateCSV = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const header = "id,name,value\n";
  const headerSize = new TextEncoder().encode(header).length;

  if (byteSize < headerSize) {
    return new Blob([header], { type: "text/csv" });
  }

  const dataSize = byteSize - headerSize;
  const rowTemplate = "0,dummy,";
  const rowTemplateSize = new TextEncoder().encode(rowTemplate).length;
  const valueSize = 100; // 각 행의 value 필드 크기
  const rowSize = rowTemplateSize + valueSize + 1; // +1 for newline

  const rowsNeeded = Math.floor(dataSize / rowSize);
  let csv = header;

  for (let i = 0; i < rowsNeeded; i++) {
    csv += `${i},dummy,${"0".repeat(valueSize)}\n`;
  }

  // 남은 공간 채우기
  const currentSize = new TextEncoder().encode(csv).length;
  const remaining = byteSize - currentSize;
  if (remaining > 0) {
    csv += "0".repeat(remaining);
  }

  return new Blob([csv], { type: "text/csv" });
};

