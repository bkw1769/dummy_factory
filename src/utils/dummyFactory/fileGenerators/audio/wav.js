/**
 * WAV 오디오 파일 생성 함수
 */
import { convertMBToBytes } from "../utils";

/**
 * WAV 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 WAV Blob
 */
export const generateWAV = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // RIFF 헤더 (12 bytes)
  const riffHeader = new Uint8Array([
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // file size - 8 (will be updated)
    0x57, 0x41, 0x56, 0x45, // "WAVE"
  ]);

  // fmt 청크 (24 bytes)
  const fmtChunk = new Uint8Array([
    0x66, 0x6d, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // chunk size: 16
    0x01, 0x00, // audio format: PCM
    0x02, 0x00, // num channels: stereo
    0x44, 0xac, 0x00, 0x00, // sample rate: 44100
    0x10, 0xb1, 0x02, 0x00, // byte rate: 176400
    0x04, 0x00, // block align: 4
    0x10, 0x00, // bits per sample: 16
  ]);

  // data 청크 헤더 (8 bytes)
  const headerSize = riffHeader.length + fmtChunk.length + 8; // +8 for data chunk header
  const dataSize = byteSize - headerSize;

  if (dataSize < 0) {
    // 최소 크기보다 작으면 최소 WAV 파일 반환
    const minWav = new Uint8Array([
      ...riffHeader,
      ...fmtChunk,
      0x64, 0x61, 0x74, 0x61, // "data"
      0x00, 0x00, 0x00, 0x00, // data size: 0
    ]);
    // 파일 크기 업데이트 (최소 크기)
    const minFileSize = minWav.length - 8;
    minWav[4] = (minFileSize >>> 24) & 0xff;
    minWav[5] = (minFileSize >>> 16) & 0xff;
    minWav[6] = (minFileSize >>> 8) & 0xff;
    minWav[7] = minFileSize & 0xff;
    return new Blob([minWav], { type: "audio/wav" });
  }

  const dataChunkHeader = new Uint8Array([
    0x64, 0x61, 0x74, 0x61, // "data"
    (dataSize >>> 24) & 0xff,
    (dataSize >>> 16) & 0xff,
    (dataSize >>> 8) & 0xff,
    dataSize & 0xff,
  ]);

  // 오디오 데이터 (무음)
  const audioData = new Uint8Array(dataSize).fill(0);

  const wav = new Uint8Array([
    ...riffHeader,
    ...fmtChunk,
    ...dataChunkHeader,
    ...audioData,
  ]);

  // 파일 크기 업데이트
  const fileSize = wav.length - 8;
  wav[4] = (fileSize >>> 24) & 0xff;
  wav[5] = (fileSize >>> 16) & 0xff;
  wav[6] = (fileSize >>> 8) & 0xff;
  wav[7] = fileSize & 0xff;

  return new Blob([wav], { type: "audio/wav" });
};

