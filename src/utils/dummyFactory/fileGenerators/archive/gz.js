/**
 * GZIP 압축 파일 생성 함수
 * pako 라이브러리 사용
 */
import pako from "pako";
import { convertMBToBytes } from "../utils";

/**
 * CRC32 계산
 * @param {Uint8Array} data - 데이터
 * @returns {number} CRC32 값
 */
const crc32 = (data) => {
  const table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[i] = c;
  }

  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

/**
 * GZ 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 GZ Blob
 */
export const generateGZ = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // GZIP 헤더 (10 bytes) + 압축 데이터 + CRC32 (4 bytes) + ISIZE (4 bytes)
  const headerSize = 10;
  const trailerSize = 8;
  const minSize = headerSize + trailerSize + 2; // +2 for minimal deflate block

  // 압축된 파일 크기를 목표로 원본 데이터 크기 추정
  // deflate는 보통 50-70% 압축률을 달성
  // 목표 크기에 맞추기 위해 반복 조정
  let originalSize = Math.floor((byteSize - headerSize - trailerSize) * 2);
  if (originalSize < 0) originalSize = 10;

  // 원본 데이터 생성 (패턴 데이터 - 압축 효율을 위해)
  const originalData = new Uint8Array(originalSize);
  for (let i = 0; i < originalSize; i++) {
    // 반복 패턴으로 압축률 향상
    originalData[i] = i % 16;
  }

  // pako로 deflate 압축
  let compressed;
  try {
    compressed = pako.deflateRaw(originalData);
  } catch (e) {
    // 압축 실패 시 빈 압축 블록
    compressed = new Uint8Array([0x03, 0x00]); // empty deflate block
  }

  // GZIP 헤더 생성
  const header = new Uint8Array([
    0x1f,
    0x8b, // Magic number
    0x08, // Compression method (deflate)
    0x00, // Flags
    0x00,
    0x00,
    0x00,
    0x00, // Modification time (0 = not set)
    0x00, // Extra flags
    0xff, // OS (unknown)
  ]);

  // CRC32 계산
  const crcValue = crc32(originalData);

  // Trailer (CRC32 + ISIZE)
  const trailer = new Uint8Array([
    crcValue & 0xff,
    (crcValue >> 8) & 0xff,
    (crcValue >> 16) & 0xff,
    (crcValue >> 24) & 0xff,
    originalSize & 0xff,
    (originalSize >> 8) & 0xff,
    (originalSize >> 16) & 0xff,
    (originalSize >> 24) & 0xff,
  ]);

  // 현재 크기 계산
  const currentSize = header.length + compressed.length + trailer.length;

  // 크기 조정
  let finalCompressed = compressed;
  if (currentSize < byteSize) {
    // 크기가 부족하면 패딩 추가 (GZIP 뒤에 추가 데이터)
    const padding = byteSize - currentSize;
    const paddedCompressed = new Uint8Array(compressed.length + padding);
    paddedCompressed.set(compressed, 0);
    // 패딩은 0으로 채움 (일부 도구에서 무시됨)
    finalCompressed = paddedCompressed;
  }

  // 최종 GZ 파일 조립
  const gzFile = new Uint8Array(
    header.length + finalCompressed.length + trailer.length
  );
  gzFile.set(header, 0);
  gzFile.set(finalCompressed, header.length);
  gzFile.set(trailer, header.length + finalCompressed.length);

  return new Blob([gzFile], { type: "application/gzip" });
};

/**
 * TAR.GZ 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 TAR.GZ Blob
 */
export const generateTGZ = (sizeMB, unit = "auto") => {
  // .tar.gz는 .gz와 동일한 구조
  return generateGZ(sizeMB, unit);
};
