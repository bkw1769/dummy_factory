/**
 * HTML 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";

/**
 * HTML 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 HTML Blob
 */
export const generateHTML = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const header = `<!DOCTYPE html>
<html>
<head><title>Dummy File</title></head>
<body>
  <div>`;
  const footer = `</div>
</body>
</html>`;

  const headerSize = new TextEncoder().encode(header).length;
  const footerSize = new TextEncoder().encode(footer).length;
  const dataSize = byteSize - headerSize - footerSize;

  if (dataSize < 0) {
    return new Blob([header + footer], { type: "text/html" });
  }

  const html = header + "0".repeat(dataSize) + footer;

  return new Blob([html], { type: "text/html" });
};

