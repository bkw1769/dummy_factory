/**
 * AVI 비디오 파일 생성 함수
 * RIFF 구조 기반 (WAV와 유사)
 */
import { convertMBToBytes } from "../utils";

/**
 * 문자열을 바이트 배열로 변환
 * @param {string} str - 변환할 문자열
 * @returns {number[]} 바이트 배열
 */
const stringToBytes = (str) => str.split("").map((c) => c.charCodeAt(0));

/**
 * 32비트 리틀 엔디안 값을 바이트 배열로 변환
 * @param {number} value - 변환할 값
 * @returns {number[]} 4바이트 배열
 */
const uint32LE = (value) => [
  value & 0xff,
  (value >> 8) & 0xff,
  (value >> 16) & 0xff,
  (value >> 24) & 0xff,
];

/**
 * 16비트 리틀 엔디안 값을 바이트 배열로 변환
 * @param {number} value - 변환할 값
 * @returns {number[]} 2바이트 배열
 */
const uint16LE = (value) => [value & 0xff, (value >> 8) & 0xff];

/**
 * AVI 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 AVI Blob
 */
export const generateAVI = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 비디오 설정
  const width = 320;
  const height = 240;
  const fps = 30;
  const frameCount = 1; // 최소 1프레임
  const bitsPerPixel = 24;
  const bytesPerLine = Math.ceil((width * bitsPerPixel) / 8);
  const paddedBytesPerLine = Math.ceil(bytesPerLine / 4) * 4; // 4바이트 정렬
  const frameSize = paddedBytesPerLine * height;

  // avih (Main AVI Header) - 56 bytes
  const avih = new Uint8Array([
    ...stringToBytes("avih"), // chunk ID
    ...uint32LE(56), // chunk size
    ...uint32LE(Math.floor(1000000 / fps)), // microseconds per frame
    ...uint32LE(bytesPerLine * height * fps), // max bytes per sec
    ...uint32LE(0), // padding granularity
    ...uint32LE(0x10), // flags (AVIF_HASINDEX)
    ...uint32LE(frameCount), // total frames
    ...uint32LE(0), // initial frames
    ...uint32LE(1), // streams
    ...uint32LE(frameSize), // suggested buffer size
    ...uint32LE(width), // width
    ...uint32LE(height), // height
    ...uint32LE(0), // reserved
    ...uint32LE(0),
    ...uint32LE(0),
    ...uint32LE(0),
  ]);

  // strh (Stream Header) - 56 bytes
  const strh = new Uint8Array([
    ...stringToBytes("strh"), // chunk ID
    ...uint32LE(56), // chunk size
    ...stringToBytes("vids"), // fccType (video)
    ...stringToBytes("DIB "), // fccHandler (uncompressed)
    ...uint32LE(0), // flags
    ...uint16LE(0), // priority
    ...uint16LE(0), // language
    ...uint32LE(0), // initial frames
    ...uint32LE(1), // scale
    ...uint32LE(fps), // rate
    ...uint32LE(0), // start
    ...uint32LE(frameCount), // length
    ...uint32LE(frameSize), // suggested buffer size
    ...uint32LE(0), // quality
    ...uint32LE(0), // sample size
    ...uint16LE(0), // left
    ...uint16LE(0), // top
    ...uint16LE(width), // right
    ...uint16LE(height), // bottom
  ]);

  // strf (Stream Format - BITMAPINFOHEADER) - 40 bytes
  const strf = new Uint8Array([
    ...stringToBytes("strf"), // chunk ID
    ...uint32LE(40), // chunk size
    ...uint32LE(40), // biSize
    ...uint32LE(width), // biWidth
    ...uint32LE(height), // biHeight
    ...uint16LE(1), // biPlanes
    ...uint16LE(bitsPerPixel), // biBitCount
    ...uint32LE(0), // biCompression (BI_RGB)
    ...uint32LE(frameSize), // biSizeImage
    ...uint32LE(0), // biXPelsPerMeter
    ...uint32LE(0), // biYPelsPerMeter
    ...uint32LE(0), // biClrUsed
    ...uint32LE(0), // biClrImportant
  ]);

  // strl LIST (Stream List)
  const strlContent = new Uint8Array([...strh, ...strf]);
  const strlList = new Uint8Array([
    ...stringToBytes("LIST"),
    ...uint32LE(4 + strlContent.length),
    ...stringToBytes("strl"),
    ...strlContent,
  ]);

  // hdrl LIST (Header List)
  const hdrlContent = new Uint8Array([...avih, ...strlList]);
  const hdrlList = new Uint8Array([
    ...stringToBytes("LIST"),
    ...uint32LE(4 + hdrlContent.length),
    ...stringToBytes("hdrl"),
    ...hdrlContent,
  ]);

  // 헤더 총 크기 계산
  const headerSize = 12 + hdrlList.length + 12; // RIFF header + hdrl + movi header
  const minMoviSize = 8 + frameSize; // "00dc" chunk with one frame

  // movi 데이터 크기 계산
  let moviDataSize = byteSize - headerSize - 8; // -8 for movi LIST header
  if (moviDataSize < minMoviSize) {
    moviDataSize = minMoviSize;
  }

  // 비디오 프레임 생성 (단색 - 파란색)
  const frameData = new Uint8Array(frameSize);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * paddedBytesPerLine + x * 3;
      frameData[idx] = 0x80; // B
      frameData[idx + 1] = 0x00; // G
      frameData[idx + 2] = 0x00; // R
    }
  }

  // 00dc 청크 (비디오 데이터)
  const videoChunk = new Uint8Array([
    ...stringToBytes("00dc"), // chunk ID (stream 0, compressed video)
    ...uint32LE(frameSize),
    ...frameData,
  ]);

  // 패딩 계산
  const paddingSize = moviDataSize - videoChunk.length;
  const padding = paddingSize > 0 ? new Uint8Array(paddingSize).fill(0) : new Uint8Array(0);

  // JUNK 청크로 패딩 (유효한 AVI 구조 유지)
  let junkChunk = new Uint8Array(0);
  if (paddingSize > 8) {
    const junkDataSize = paddingSize - 8;
    junkChunk = new Uint8Array([
      ...stringToBytes("JUNK"),
      ...uint32LE(junkDataSize),
      ...new Uint8Array(junkDataSize).fill(0),
    ]);
  }

  // movi LIST
  const moviContent = new Uint8Array([...videoChunk, ...junkChunk]);
  const moviList = new Uint8Array([
    ...stringToBytes("LIST"),
    ...uint32LE(4 + moviContent.length),
    ...stringToBytes("movi"),
    ...moviContent,
  ]);

  // RIFF 파일 조립
  const riffContent = new Uint8Array([...hdrlList, ...moviList]);
  const riffFile = new Uint8Array([
    ...stringToBytes("RIFF"),
    ...uint32LE(4 + riffContent.length),
    ...stringToBytes("AVI "),
    ...riffContent,
  ]);

  return new Blob([riffFile], { type: "video/x-msvideo" });
};
