/**
 * ICO 이미지 파일 생성 함수
 * Canvas API를 사용하여 실제 유효한 ICO 파일 생성
 */
import { convertMBToBytes } from "../utils";

/**
 * ICO 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 ICO Blob
 */
export const generateICO = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 ICO 크기
  const minICOSize = 100;
  if (byteSize < minICOSize) {
    // 최소 크기보다 작으면 16x16 픽셀 ICO 생성
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 16, 16);

    return createICOFromCanvas(canvas, byteSize);
  }

  // ICO는 여러 크기의 아이콘을 포함할 수 있음
  // 단일 아이콘으로 생성
  const headerSize = 22; // ICO 헤더 크기
  const entrySize = 16; // 디렉토리 엔트리 크기
  const bmpHeaderSize = 40; // BMP 헤더 크기

  // 이미지 크기 계산
  const pixelsNeeded = Math.floor(
    (byteSize - headerSize - entrySize - bmpHeaderSize) / 4
  );
  const dimension = Math.floor(Math.sqrt(pixelsNeeded));

  // ICO는 보통 16x16, 32x32, 48x48, 256x256 크기 사용
  // 하지만 목표 크기에 맞춰 조정
  const maxDimension = 256;
  const width = Math.min(Math.max(16, dimension), maxDimension);
  const height = width; // 정사각형

  // Canvas 생성
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  // 이미지 데이터 생성 (패턴으로 채우기)
  const imageData = ctx.createImageData(width, height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const value = (x + y) % 256;
      imageData.data[idx] = value; // R
      imageData.data[idx + 1] = value; // G
      imageData.data[idx + 2] = value; // B
      imageData.data[idx + 3] = 255; // A
    }
  }
  ctx.putImageData(imageData, 0, 0);

  return createICOFromCanvas(canvas, byteSize);
};

/**
 * Canvas에서 ICO 파일 생성
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} targetSize - 목표 크기
 * @returns {Promise<Blob>} 생성된 ICO Blob
 */
function createICOFromCanvas(canvas, targetSize) {
  return new Promise((resolve) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height);

    // ICO 파일 헤더 (6 bytes)
    const icoHeader = new Uint8Array([
      0x00, 0x00, // reserved
      0x01, 0x00, // type: 1 (ICO)
      0x01, 0x00, // number of images: 1
    ]);

    // 디렉토리 엔트리 (16 bytes)
    const bmpData = createBMPDataForICO(imageData, width, height);
    const bmpSize = bmpData.length;
    const offset = 22; // 헤더(6) + 엔트리(16)

    const directoryEntry = new Uint8Array([
      width === 256 ? 0 : width, // width (0 = 256)
      height === 256 ? 0 : height, // height (0 = 256)
      0x00, // color palette (0 = no palette)
      0x00, // reserved
      0x01, 0x00, // color planes: 1
      0x20, 0x00, // bits per pixel: 32
      (bmpSize >>> 0) & 0xff,
      (bmpSize >>> 8) & 0xff,
      (bmpSize >>> 16) & 0xff,
      (bmpSize >>> 24) & 0xff, // BMP 데이터 크기
      (offset >>> 0) & 0xff,
      (offset >>> 8) & 0xff,
      (offset >>> 16) & 0xff,
      (offset >>> 24) & 0xff, // BMP 데이터 오프셋
    ]);

    const totalSize = icoHeader.length + directoryEntry.length + bmpSize;
    const ico = new Uint8Array(Math.min(totalSize, targetSize));

    // 헤더 복사
    ico.set(icoHeader, 0);
    ico.set(directoryEntry, icoHeader.length);
    ico.set(bmpData, icoHeader.length + directoryEntry.length);

    // 크기가 부족하면 추가 데이터 추가
    if (totalSize < targetSize) {
      const additionalBytes = targetSize - totalSize;
      const additionalData = new Uint8Array(additionalBytes).fill(0);
      const combined = new Uint8Array(totalSize + additionalBytes);
      combined.set(ico, 0);
      combined.set(additionalData, totalSize);
      resolve(new Blob([combined], { type: "image/x-icon" }));
    } else {
      resolve(new Blob([ico], { type: "image/x-icon" }));
    }
  });
}

/**
 * ICO용 BMP 데이터 생성
 * @param {ImageData} imageData - 이미지 데이터
 * @param {number} width - 너비
 * @param {number} height - 높이
 * @returns {Uint8Array} BMP 데이터
 */
function createBMPDataForICO(imageData, width, height) {
  // BMP 정보 헤더 (40 bytes)
  const infoHeader = new Uint8Array([
    0x28, 0x00, 0x00, 0x00, // header size: 40
    (width >>> 0) & 0xff,
    (width >>> 8) & 0xff,
    (width >>> 16) & 0xff,
    (width >>> 24) & 0xff, // width
    ((height * 2) >>> 0) & 0xff,
    ((height * 2) >>> 8) & 0xff,
    ((height * 2) >>> 16) & 0xff,
    ((height * 2) >>> 24) & 0xff, // height (ICO는 2배 높이, 마스크 포함)
    0x01, 0x00, // planes: 1
    0x20, 0x00, // bits per pixel: 32
    0x00, 0x00, 0x00, 0x00, // compression: none
    0x00, 0x00, 0x00, 0x00, // image size
    0x00, 0x00, 0x00, 0x00, // x pixels per meter
    0x00, 0x00, 0x00, 0x00, // y pixels per meter
    0x00, 0x00, 0x00, 0x00, // colors used
    0x00, 0x00, 0x00, 0x00, // important colors
  ]);

  // 픽셀 데이터 (BMP 형식, BGR, bottom-up)
  const rowSize = width * 4;
  const padding = (4 - (rowSize % 4)) % 4;
  const pixelDataSize = (rowSize + padding) * height;
  const pixelData = new Uint8Array(pixelDataSize);

  // 이미지 데이터를 BMP 형식으로 변환
  for (let y = 0; y < height; y++) {
    const srcY = height - 1 - y; // bottom-up
    for (let x = 0; x < width; x++) {
      const srcIdx = (srcY * width + x) * 4;
      const dstIdx = y * (rowSize + padding) + x * 4;
      pixelData[dstIdx] = imageData.data[srcIdx + 2]; // B
      pixelData[dstIdx + 1] = imageData.data[srcIdx + 1]; // G
      pixelData[dstIdx + 2] = imageData.data[srcIdx]; // R
      pixelData[dstIdx + 3] = imageData.data[srcIdx + 3]; // A
    }
  }

  // 마스크 데이터 (1비트 마스크, 투명도용)
  const maskRowSize = Math.ceil(width / 8);
  const maskPadding = (4 - (maskRowSize % 4)) % 4;
  const maskDataSize = (maskRowSize + maskPadding) * height;
  const maskData = new Uint8Array(maskDataSize).fill(0xff); // 모두 불투명

  const bmpData = new Uint8Array(
    infoHeader.length + pixelDataSize + maskDataSize
  );
  bmpData.set(infoHeader, 0);
  bmpData.set(pixelData, infoHeader.length);
  bmpData.set(maskData, infoHeader.length + pixelDataSize);

  return bmpData;
}

