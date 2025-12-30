/**
 * ZIP 압축 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";
import JSZip from "jszip";

/**
 * ZIP 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 ZIP Blob
 */
export const generateZIP = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  const zip = new JSZip();

  // 최소 ZIP 크기 (헤더 등)
  const minZIPSize = 100;
  if (byteSize < minZIPSize) {
    // 최소 크기보다 작으면 빈 ZIP 파일 생성
    zip.file("dummy.txt", "");
    const blob = await zip.generateAsync({ type: "blob" });
    return blob;
  }

  // ZIP 파일 내부에 더미 파일 생성
  // 압축률을 고려하여 데이터 크기 계산
  // ZIP은 압축되므로 압축률을 50%로 가정
  const uncompressedSize = Math.floor(byteSize * 2);
  
  // 단일 파일로 생성 (여러 파일로 나누는 것도 가능)
  const dummyContent = "0".repeat(uncompressedSize);
  zip.file("dummy.txt", dummyContent);

  // ZIP 생성 (압축 없이 저장하여 정확한 크기 제어)
  let blob = await zip.generateAsync({
    type: "blob",
    compression: "STORE", // 압축 없이 저장
  });

  // 크기가 부족하면 추가 파일 추가
  if (blob.size < byteSize) {
    const remainingSize = byteSize - blob.size;
    const additionalContent = "0".repeat(remainingSize);
    zip.file("additional.txt", additionalContent);
    blob = await zip.generateAsync({
      type: "blob",
      compression: "STORE",
    });
  } else if (blob.size > byteSize) {
    // 크기가 초과하면 파일 크기 조정
    const scale = byteSize / blob.size;
    const adjustedSize = Math.floor(uncompressedSize * scale);
    const adjustedContent = "0".repeat(adjustedSize);
    
    const newZip = new JSZip();
    newZip.file("dummy.txt", adjustedContent);
    blob = await newZip.generateAsync({
      type: "blob",
      compression: "STORE",
    });
  }

  return blob;
};

