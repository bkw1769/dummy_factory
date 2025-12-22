/**
 * JSON 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";

/**
 * JSON 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 JSON Blob
 */
export const generateJSON = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const minJsonSize = 2; // 최소 "{}" 크기
  const dataSize = byteSize - minJsonSize;

  if (dataSize < 0) {
    // 너무 작은 크기면 최소 JSON 반환
    return new Blob(['{}'], { type: "application/json" });
  }

  // 큰 JSON 객체 생성
  // 문자열로 크기를 채우되, JSON 구조를 유지
  const jsonData = {
    type: "dummy_file",
    size: sizeMB,
    generated: new Date().toISOString(),
    data: "0".repeat(Math.floor(dataSize / 2)), // 문자열로 크기 채우기
  };

  const jsonString = JSON.stringify(jsonData);

  // 크기가 정확하지 않으면 조정
  if (jsonString.length < byteSize) {
    const padding = byteSize - jsonString.length;
    const paddedData = {
      ...jsonData,
      padding: "0".repeat(padding),
    };
    return new Blob([JSON.stringify(paddedData)], { type: "application/json" });
  }

  return new Blob([jsonString], { type: "application/json" });
};

