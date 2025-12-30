/**
 * XLS 파일 생성 함수
 * 간단한 XLS 구조 생성 (MS Excel 97-2003 형식)
 */
import { convertMBToBytes } from "../utils";

/**
 * XLS 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 XLS Blob
 */
export const generateXLS = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // XLS 파일은 OLE2 구조를 사용하지만 매우 복잡함
  // 간단한 구조로 생성
  
  // 최소 XLS 크기
  const minXLSSize = 100;
  if (byteSize < minXLSSize) {
    const minXls = new Uint8Array([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, // OLE2 signature
    ]);
    return new Blob([minXls], {
      type: "application/vnd.ms-excel",
    });
  }

  // OLE2 헤더 (512 bytes)
  const oleHeader = new Uint8Array(512);
  oleHeader[0] = 0xd0;
  oleHeader[1] = 0xcf;
  oleHeader[2] = 0x11;
  oleHeader[3] = 0xe0;
  oleHeader[4] = 0xa1;
  oleHeader[5] = 0xb1;
  oleHeader[6] = 0x1a;
  oleHeader[7] = 0xe1;

  // Workbook 스트림 데이터
  const workbookSize = byteSize - oleHeader.length;
  const workbookData = new Uint8Array(workbookSize);
  
  const text = "Dummy XLS file content. ";
  const textBytes = new TextEncoder().encode(text);
  for (let i = 0; i < workbookSize; i++) {
    workbookData[i] = textBytes[i % textBytes.length];
  }

  const xls = new Uint8Array([...oleHeader, ...workbookData]);

  return new Blob([xls], { type: "application/vnd.ms-excel" });
};

