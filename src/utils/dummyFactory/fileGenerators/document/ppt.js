/**
 * PPT 파일 생성 함수
 * 간단한 PPT 구조 생성 (MS PowerPoint 97-2003 형식)
 */
import { convertMBToBytes } from "../utils";

/**
 * PPT 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 PPT Blob
 */
export const generatePPT = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // PPT 파일은 OLE2 구조를 사용하지만 매우 복잡함
  // 간단한 구조로 생성
  
  // 최소 PPT 크기
  const minPPTSize = 100;
  if (byteSize < minPPTSize) {
    const minPpt = new Uint8Array([
      0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1, // OLE2 signature
    ]);
    return new Blob([minPpt], {
      type: "application/vnd.ms-powerpoint",
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

  // PowerPointDocument 스트림 데이터
  const pptDocSize = byteSize - oleHeader.length;
  const pptDocData = new Uint8Array(pptDocSize);
  
  const text = "Dummy PPT file content. ";
  const textBytes = new TextEncoder().encode(text);
  for (let i = 0; i < pptDocSize; i++) {
    pptDocData[i] = textBytes[i % textBytes.length];
  }

  const ppt = new Uint8Array([...oleHeader, ...pptDocData]);

  return new Blob([ppt], { type: "application/vnd.ms-powerpoint" });
};

