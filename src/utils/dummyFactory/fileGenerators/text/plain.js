/**
 * 일반 텍스트 파일 생성 함수 (TXT, MD, CSS, JS, YAML, SQL 등)
 */
import { convertMBToBytes } from "../utils";
import { EXTENSION_MIME_TYPES } from "@/constants/dummyFactory/fileTypes";

/**
 * 일반 텍스트 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} ext - 파일 확장자
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 텍스트 Blob
 */
export const generateTextFile = (sizeMB, ext, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);
  const mimeType = EXTENSION_MIME_TYPES[ext] || "text/plain";
  const content = "0".repeat(byteSize);

  return new Blob([content], { type: mimeType });
};

/**
 * TXT 파일 생성
 */
export const generateTXT = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".txt", unit);
};

/**
 * MD 파일 생성
 */
export const generateMD = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".md", unit);
};

/**
 * CSS 파일 생성
 */
export const generateCSS = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".css", unit);
};

/**
 * JS 파일 생성
 */
export const generateJS = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".js", unit);
};

/**
 * YAML 파일 생성
 */
export const generateYAML = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".yaml", unit);
};

/**
 * SQL 파일 생성
 */
export const generateSQL = (sizeMB, unit = "auto") => {
  return generateTextFile(sizeMB, ".sql", unit);
};

