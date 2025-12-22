/**
 * DOC 파일 생성 함수
 * 간단한 DOC 구조 생성 (MS Word 97-2003 형식)
 */
import { convertMBToBytes } from "../utils";

/**
 * DOC 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 DOC Blob
 */
export const generateDOC = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // DOC 파일은 OLE2 구조를 사용하지만 매우 복잡함
  // 간단한 구조로 생성 (일부 뷰어에서 열 수 없을 수 있음)
  
  // 최소 DOC 크기
  const minDOCSize = 100;
  if (byteSize < minDOCSize) {
    // 최소 크기보다 작으면 최소 DOC 반환
    const minDoc = new Uint8Array([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, // OLE2 signature
    ]);
    return new Blob([minDoc], { type: "application/msword" });
  }

  // OLE2 헤더 (512 bytes)
  const oleHeader = new Uint8Array(512);
  // OLE2 시그니처
  oleHeader[0] = 0xd0;
  oleHeader[1] = 0xcf;
  oleHeader[2] = 0x11;
  oleHeader[3] = 0xe0;
  oleHeader[4] = 0xa1;
  oleHeader[5] = 0xb1;
  oleHeader[6] = 0x1a;
  oleHeader[7] = 0xe1;

  // WordDocument 스트림 데이터
  const wordDocSize = byteSize - oleHeader.length;
  const wordDocData = new Uint8Array(wordDocSize);
  
  // 간단한 텍스트 데이터로 채우기
  const text = "Dummy DOC file content. ";
  const textBytes = new TextEncoder().encode(text);
  for (let i = 0; i < wordDocSize; i++) {
    wordDocData[i] = textBytes[i % textBytes.length];
  }

  const doc = new Uint8Array([...oleHeader, ...wordDocData]);

  return new Blob([doc], { type: "application/msword" });
};

