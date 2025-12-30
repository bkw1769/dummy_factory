/**
 * TAR 아카이브 파일 생성 함수
 * POSIX ustar 형식
 */
import { convertMBToBytes } from "../utils";

/**
 * 문자열을 고정 길이 바이트 배열로 변환 (null padding)
 * @param {string} str - 변환할 문자열
 * @param {number} length - 목표 길이
 * @returns {Uint8Array} 바이트 배열
 */
const stringToFixedBytes = (str, length) => {
  const bytes = new Uint8Array(length);
  const encoded = new TextEncoder().encode(str);
  bytes.set(encoded.slice(0, length - 1), 0);
  return bytes;
};

/**
 * 숫자를 8진수 문자열로 변환 (고정 길이, null 종료)
 * @param {number} value - 변환할 값
 * @param {number} length - 목표 길이 (null 포함)
 * @returns {Uint8Array} 바이트 배열
 */
const octalString = (value, length) => {
  const str = value.toString(8).padStart(length - 1, "0");
  const bytes = new Uint8Array(length);
  for (let i = 0; i < str.length && i < length - 1; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  bytes[length - 1] = 0; // null terminator
  return bytes;
};

/**
 * TAR 헤더 체크섬 계산
 * @param {Uint8Array} header - 512바이트 헤더
 * @returns {number} 체크섬
 */
const calculateChecksum = (header) => {
  let sum = 0;
  for (let i = 0; i < 512; i++) {
    // 체크섬 필드(148-155)는 공백으로 처리
    if (i >= 148 && i < 156) {
      sum += 32; // space
    } else {
      sum += header[i];
    }
  }
  return sum;
};

/**
 * TAR 파일 헤더 생성 (512 bytes)
 * @param {string} filename - 파일명
 * @param {number} filesize - 파일 크기
 * @returns {Uint8Array} TAR 헤더
 */
const createTarHeader = (filename, filesize) => {
  const header = new Uint8Array(512);

  // File name (0-99, 100 bytes)
  header.set(stringToFixedBytes(filename, 100), 0);

  // File mode (100-107, 8 bytes) - 0644
  header.set(octalString(0o644, 8), 100);

  // Owner UID (108-115, 8 bytes)
  header.set(octalString(0, 8), 108);

  // Owner GID (116-123, 8 bytes)
  header.set(octalString(0, 8), 116);

  // File size (124-135, 12 bytes)
  header.set(octalString(filesize, 12), 124);

  // Modification time (136-147, 12 bytes) - current time
  const mtime = Math.floor(Date.now() / 1000);
  header.set(octalString(mtime, 12), 136);

  // Checksum placeholder (148-155, 8 bytes) - will be calculated
  header.set(new Uint8Array([32, 32, 32, 32, 32, 32, 32, 32]), 148);

  // Type flag (156, 1 byte) - '0' for regular file
  header[156] = 48; // '0'

  // Link name (157-256, 100 bytes) - empty
  // Already zero-filled

  // Magic (257-262, 6 bytes) - "ustar\0"
  header.set(new TextEncoder().encode("ustar"), 257);
  header[262] = 0;

  // Version (263-264, 2 bytes) - "00"
  header[263] = 48; // '0'
  header[264] = 48; // '0'

  // Owner user name (265-296, 32 bytes)
  header.set(stringToFixedBytes("user", 32), 265);

  // Owner group name (297-328, 32 bytes)
  header.set(stringToFixedBytes("group", 32), 297);

  // Device major (329-336, 8 bytes)
  header.set(octalString(0, 8), 329);

  // Device minor (337-344, 8 bytes)
  header.set(octalString(0, 8), 337);

  // Filename prefix (345-499, 155 bytes) - empty for short names

  // Calculate and set checksum
  const checksum = calculateChecksum(header);
  const checksumStr = checksum.toString(8).padStart(6, "0") + "\0 ";
  for (let i = 0; i < 8; i++) {
    header[148 + i] = checksumStr.charCodeAt(i);
  }

  return header;
};

/**
 * TAR 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 TAR Blob
 */
export const generateTAR = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // TAR 구조: 헤더(512) + 데이터(512 단위 패딩) + EOF(1024)
  const headerSize = 512;
  const eofSize = 1024;
  const minSize = headerSize + eofSize;

  if (byteSize < minSize) {
    // 최소 크기의 빈 TAR 파일
    const tarFile = new Uint8Array(minSize);
    const header = createTarHeader("dummy.bin", 0);
    tarFile.set(header, 0);
    // EOF: 1024 bytes of zeros (already zero-filled)
    return new Blob([tarFile], { type: "application/x-tar" });
  }

  // 파일 데이터 크기 계산 (512 바이트 단위로 정렬)
  let fileDataSize = byteSize - headerSize - eofSize;
  const padding = (512 - (fileDataSize % 512)) % 512;
  fileDataSize = fileDataSize - padding; // 패딩 공간 확보

  if (fileDataSize < 0) fileDataSize = 0;

  // 512 바이트 단위로 정렬
  const alignedDataSize = Math.ceil(fileDataSize / 512) * 512;

  // TAR 파일 생성
  const totalSize = headerSize + alignedDataSize + eofSize;
  const tarFile = new Uint8Array(totalSize);

  // 헤더 생성
  const header = createTarHeader("dummy.bin", fileDataSize);
  tarFile.set(header, 0);

  // 파일 데이터 (패턴으로 채움)
  for (let i = 0; i < fileDataSize; i++) {
    tarFile[headerSize + i] = i % 256;
  }

  // EOF: 1024 bytes of zeros (already zero-filled at the end)

  return new Blob([tarFile], { type: "application/x-tar" });
};
