/**
 * TIFF 이미지 파일 생성 함수
 * Canvas API를 사용하여 실제 유효한 TIFF 파일 생성
 */
import { convertMBToBytes } from "../utils";

/**
 * TIFF 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 TIFF Blob
 */
export const generateTIFF = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 TIFF 크기
  const minTIFFSize = 200;
  if (byteSize < minTIFFSize) {
    // 최소 크기보다 작으면 1x1 픽셀 TIFF 생성
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);

    return createTIFFFromCanvas(canvas, byteSize);
  }

  // 이미지 크기 계산
  // TIFF는 압축되지 않을 수 있으므로 크기 예측이 상대적으로 쉬움
  const headerSize = 200; // 대략적인 헤더 크기
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

  return createTIFFFromCanvas(canvas, byteSize);
};

/**
 * Canvas에서 TIFF 파일 생성
 * @param {HTMLCanvasElement} canvas - Canvas 요소
 * @param {number} targetSize - 목표 크기
 * @returns {Promise<Blob>} 생성된 TIFF Blob
 */
function createTIFFFromCanvas(canvas, targetSize) {
  return new Promise((resolve) => {
    const width = canvas.width;
    const height = canvas.height;
    const ctx = canvas.getContext("2d");
    const imageData = ctx.getImageData(0, 0, width, height);

    // 픽셀 데이터 (RGB, interleaved, top-to-bottom)
    const pixelDataSize = width * height * 3;
    const pixelData = new Uint8Array(pixelDataSize);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + x) * 3;
        pixelData[dstIdx] = imageData.data[srcIdx]; // R
        pixelData[dstIdx + 1] = imageData.data[srcIdx + 1]; // G
        pixelData[dstIdx + 2] = imageData.data[srcIdx + 2]; // B
      }
    }

    // TIFF 파일 헤더 (8 bytes)
    const tiffHeader = new Uint8Array([
      0x49, 0x49, // Byte order: Intel (little-endian) "II"
      0x2a, 0x00, // Version: 42
      0x08, 0x00, 0x00, 0x00, // IFD offset: 8 (헤더 바로 다음)
    ]);

    // IFD 엔트리 수 계산 및 오프셋 계산
    const ifdEntryCount = 11; // 필요한 엔트리 수
    const ifdSize = 2 + ifdEntryCount * 12 + 4; // 엔트리 수(2) + 엔트리들(12*11) + Next IFD(4)
    
    // BitsPerSample 오프셋 (IFD 바로 다음)
    const bitsPerSampleOffset = 8 + ifdSize;
    
    // XResolution 오프셋
    const xResolutionOffset = bitsPerSampleOffset + 6; // BitsPerSample(6 bytes)
    
    // YResolution 오프셋
    const yResolutionOffset = xResolutionOffset + 8; // XResolution(8 bytes)
    
    // StripOffsets (픽셀 데이터 오프셋)
    const stripOffset = yResolutionOffset + 8; // YResolution(8 bytes)

    // IFD 엔트리 수 (2 bytes)
    const ifdEntryCountBytes = new Uint8Array([
      (ifdEntryCount >>> 0) & 0xff,
      (ifdEntryCount >>> 8) & 0xff,
    ]);

    // IFD 엔트리들 (각 12 bytes)
    const ifdEntries = new Uint8Array(ifdEntryCount * 12);
    let entryOffset = 0;

    // ImageWidth (256) - SHORT
    setIFDEntry(ifdEntries, entryOffset, 0x0100, 3, 1, width);
    entryOffset += 12;

    // ImageLength (257) - SHORT
    setIFDEntry(ifdEntries, entryOffset, 0x0101, 3, 1, height);
    entryOffset += 12;

    // BitsPerSample (258) - SHORT, count 3, offset
    setIFDEntry(ifdEntries, entryOffset, 0x0102, 3, 3, bitsPerSampleOffset);
    entryOffset += 12;

    // Compression (259) - SHORT, value 1 (No compression)
    setIFDEntry(ifdEntries, entryOffset, 0x0103, 3, 1, 1);
    entryOffset += 12;

    // PhotometricInterpretation (262) - SHORT, value 2 (RGB)
    setIFDEntry(ifdEntries, entryOffset, 0x0106, 3, 1, 2);
    entryOffset += 12;

    // StripOffsets (273) - LONG, offset
    setIFDEntry(ifdEntries, entryOffset, 0x0111, 4, 1, stripOffset);
    entryOffset += 12;

    // SamplesPerPixel (277) - SHORT, value 3
    setIFDEntry(ifdEntries, entryOffset, 0x0115, 3, 1, 3);
    entryOffset += 12;

    // RowsPerStrip (278) - LONG, value height
    setIFDEntry(ifdEntries, entryOffset, 0x0116, 4, 1, height);
    entryOffset += 12;

    // StripByteCounts (279) - LONG, pixelDataSize
    setIFDEntry(ifdEntries, entryOffset, 0x0117, 4, 1, pixelDataSize);
    entryOffset += 12;

    // XResolution (282) - RATIONAL, offset
    setIFDEntry(ifdEntries, entryOffset, 0x011a, 5, 1, xResolutionOffset);
    entryOffset += 12;

    // YResolution (283) - RATIONAL, offset
    setIFDEntry(ifdEntries, entryOffset, 0x011b, 5, 1, yResolutionOffset);
    entryOffset += 12;

    // Next IFD offset (4 bytes) - 0 (no next IFD)
    const nextIFDOffset = new Uint8Array([0x00, 0x00, 0x00, 0x00]);

    // BitsPerSample 값 (6 bytes: 3 * SHORT)
    const bitsPerSample = new Uint8Array([
      0x08, 0x00, // 8 bits per sample (R)
      0x08, 0x00, // 8 bits per sample (G)
      0x08, 0x00, // 8 bits per sample (B)
    ]);

    // XResolution 값 (8 bytes: RATIONAL)
    const xResolution = new Uint8Array([
      0x48, 0x00, 0x00, 0x00, // numerator: 72
      0x01, 0x00, 0x00, 0x00, // denominator: 1
    ]);

    // YResolution 값 (8 bytes: RATIONAL)
    const yResolution = new Uint8Array([
      0x48, 0x00, 0x00, 0x00, // numerator: 72
      0x01, 0x00, 0x00, 0x00, // denominator: 1
    ]);

    // 전체 파일 크기 계산
    const totalSize =
      tiffHeader.length + // 8
      ifdEntryCountBytes.length + // 2
      ifdEntries.length + // 12 * 11 = 132
      nextIFDOffset.length + // 4
      bitsPerSample.length + // 6
      xResolution.length + // 8
      yResolution.length + // 8
      pixelDataSize; // width * height * 3

    // 실제 사용할 크기 (targetSize와 비교)
    const actualSize = Math.min(totalSize, targetSize);
    const actualPixelDataSize = Math.max(
      0,
      actualSize -
        (tiffHeader.length +
          ifdEntryCountBytes.length +
          ifdEntries.length +
          nextIFDOffset.length +
          bitsPerSample.length +
          xResolution.length +
          yResolution.length)
    );

    // TIFF 파일 생성
    const tiff = new Uint8Array(actualSize);
    let offset = 0;

    // 헤더
    tiff.set(tiffHeader, offset);
    offset += tiffHeader.length;

    // IFD 엔트리 수
    tiff.set(ifdEntryCountBytes, offset);
    offset += ifdEntryCountBytes.length;

    // IFD 엔트리들
    tiff.set(ifdEntries, offset);
    offset += ifdEntries.length;

    // Next IFD offset
    tiff.set(nextIFDOffset, offset);
    offset += nextIFDOffset.length;

    // BitsPerSample
    tiff.set(bitsPerSample, offset);
    offset += bitsPerSample.length;

    // XResolution
    tiff.set(xResolution, offset);
    offset += xResolution.length;

    // YResolution
    tiff.set(yResolution, offset);
    offset += yResolution.length;

    // 픽셀 데이터
    tiff.set(pixelData.slice(0, actualPixelDataSize), offset);
    offset += actualPixelDataSize;

    // 크기가 부족하면 추가 데이터 추가
    if (actualSize < targetSize) {
      const additionalBytes = targetSize - actualSize;
      const additionalData = new Uint8Array(additionalBytes).fill(0);
      const combined = new Uint8Array(actualSize + additionalBytes);
      combined.set(tiff, 0);
      combined.set(additionalData, actualSize);
      resolve(new Blob([combined], { type: "image/tiff" }));
    } else {
      resolve(new Blob([tiff], { type: "image/tiff" }));
    }
  });
}

/**
 * IFD 엔트리 설정 헬퍼 함수
 * @param {Uint8Array} ifdEntries - IFD 엔트리 배열
 * @param {number} offset - 엔트리 오프셋
 * @param {number} tag - 태그 번호
 * @param {number} type - 데이터 타입 (3=SHORT, 4=LONG, 5=RATIONAL)
 * @param {number} count - 값 개수
 * @param {number} value - 값 또는 오프셋
 */
function setIFDEntry(ifdEntries, offset, tag, type, count, value) {
  // Tag (2 bytes)
  ifdEntries[offset] = (tag >>> 0) & 0xff;
  ifdEntries[offset + 1] = (tag >>> 8) & 0xff;

  // Type (2 bytes)
  ifdEntries[offset + 2] = (type >>> 0) & 0xff;
  ifdEntries[offset + 3] = (type >>> 8) & 0xff;

  // Count (4 bytes)
  ifdEntries[offset + 4] = (count >>> 0) & 0xff;
  ifdEntries[offset + 5] = (count >>> 8) & 0xff;
  ifdEntries[offset + 6] = (count >>> 16) & 0xff;
  ifdEntries[offset + 7] = (count >>> 24) & 0xff;

  // Value/Offset (4 bytes)
  if (type === 3 && count === 1) {
    // SHORT, count 1: 값이 직접 저장됨
    ifdEntries[offset + 8] = (value >>> 0) & 0xff;
    ifdEntries[offset + 9] = (value >>> 8) & 0xff;
    ifdEntries[offset + 10] = 0x00;
    ifdEntries[offset + 11] = 0x00;
  } else {
    // LONG 또는 오프셋: 오프셋 저장
    ifdEntries[offset + 8] = (value >>> 0) & 0xff;
    ifdEntries[offset + 9] = (value >>> 8) & 0xff;
    ifdEntries[offset + 10] = (value >>> 16) & 0xff;
    ifdEntries[offset + 11] = (value >>> 24) & 0xff;
  }
}

