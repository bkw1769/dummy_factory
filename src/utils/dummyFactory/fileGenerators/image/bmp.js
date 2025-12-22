/**
 * BMP 이미지 파일 생성 함수
 * Canvas API를 사용하여 실제 유효한 BMP 파일 생성
 */
import { convertMBToBytes } from "../utils";

/**
 * BMP 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 BMP Blob
 */
export const generateBMP = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 BMP 크기
  const minBMPSize = 100;
  if (byteSize < minBMPSize) {
    // 최소 크기보다 작으면 1x1 픽셀 BMP 생성
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);

    // Canvas를 ImageData로 변환 후 BMP 구조 생성
    return createBMPFromCanvas(canvas, byteSize);
  }

  // 이미지 크기 계산
  // BMP는 압축되지 않으므로 크기 예측이 상대적으로 쉬움
  // RGBA, 4 bytes per pixel + 헤더
  const headerSize = 54; // BMP 헤더 크기
  const pixelsNeeded = Math.floor((byteSize - headerSize) / 4);
  const dimension = Math.floor(Math.sqrt(pixelsNeeded));

  // 너무 크면 제한
  const maxDimension = 10000;
  const width = Math.min(dimension, maxDimension);
  const height = Math.min(Math.floor(pixelsNeeded / width), maxDimension);

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

  return createBMPFromCanvas(canvas, byteSize);
};

/**
 * Canvas에서 BMP 파일 생성
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} targetSize - 목표 크기
 * @returns {Promise<Blob>} 생성된 BMP Blob
 */
function createBMPFromCanvas(canvas, targetSize) {
  return new Promise((resolve) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height);

    // BMP 파일 헤더 (14 bytes)
    const fileHeader = new Uint8Array([
      0x42, 0x4d, // "BM"
      0x00, 0x00, 0x00, 0x00, // file size (will be updated)
      0x00, 0x00, // reserved
      0x00, 0x00, // reserved
      0x36, 0x00, 0x00, 0x00, // offset to pixel data (54 bytes)
    ]);

    // BMP 정보 헤더 (40 bytes)
    const infoHeader = new Uint8Array([
      0x28, 0x00, 0x00, 0x00, // header size: 40
      (width >>> 0) & 0xff,
      (width >>> 8) & 0xff,
      (width >>> 16) & 0xff,
      (width >>> 24) & 0xff, // width
      (height >>> 0) & 0xff,
      (height >>> 8) & 0xff,
      (height >>> 16) & 0xff,
      (height >>> 24) & 0xff, // height
      0x01, 0x00, // planes: 1
      0x20, 0x00, // bits per pixel: 32 (RGBA)
      0x00, 0x00, 0x00, 0x00, // compression: none
      0x00, 0x00, 0x00, 0x00, // image size (can be 0 for uncompressed)
      0x00, 0x00, 0x00, 0x00, // x pixels per meter
      0x00, 0x00, 0x00, 0x00, // y pixels per meter
      0x00, 0x00, 0x00, 0x00, // colors used
      0x00, 0x00, 0x00, 0x00, // important colors
    ]);

    // 픽셀 데이터 (BMP는 bottom-up 형식)
    const rowSize = width * 4;
    const padding = (4 - (rowSize % 4)) % 4; // 행은 4바이트로 정렬
    const pixelDataSize = (rowSize + padding) * height;
    const pixelData = new Uint8Array(pixelDataSize);

    // 이미지 데이터를 BMP 형식으로 변환 (BGR, bottom-up)
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

    const totalSize = fileHeader.length + infoHeader.length + pixelDataSize;
    const bmp = new Uint8Array(totalSize);

    // 헤더 복사
    bmp.set(fileHeader, 0);
    bmp.set(infoHeader, fileHeader.length);
    bmp.set(pixelData, fileHeader.length + infoHeader.length);

    // 파일 크기 업데이트
    const fileSize = Math.min(totalSize, targetSize);
    bmp[2] = (fileSize >>> 0) & 0xff;
    bmp[3] = (fileSize >>> 8) & 0xff;
    bmp[4] = (fileSize >>> 16) & 0xff;
    bmp[5] = (fileSize >>> 24) & 0xff;

    // 크기가 부족하면 추가 데이터 추가
    if (fileSize < targetSize) {
      const additionalBytes = targetSize - fileSize;
      const additionalData = new Uint8Array(additionalBytes).fill(0);
      const combined = new Uint8Array(fileSize + additionalBytes);
      combined.set(bmp.slice(0, fileSize), 0);
      combined.set(additionalData, fileSize);
      resolve(new Blob([combined], { type: "image/bmp" }));
    } else {
      resolve(new Blob([bmp.slice(0, fileSize)], { type: "image/bmp" }));
    }
  });
}

