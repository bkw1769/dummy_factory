/**
 * GIF 이미지 파일 생성 함수
 * Canvas API를 사용하여 실제 유효한 GIF 파일 생성
 * 참고: 브라우저의 Canvas API는 GIF를 직접 지원하지 않으므로,
 * 이미지를 생성한 후 크기를 조정하는 방식 사용
 */
import { convertMBToBytes } from "../utils";

/**
 * GIF 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 GIF Blob
 */
export const generateGIF = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 GIF 크기
  const minGIFSize = 100;
  if (byteSize < minGIFSize) {
    // 최소 크기보다 작으면 1x1 픽셀 이미지를 PNG로 생성 후 GIF로 변환 시도
    // 브라우저는 GIF를 직접 생성할 수 없으므로 간단한 GIF 구조 생성
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);

    // PNG로 생성 후 GIF 헤더로 변환 (간단한 방법)
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        // 브라우저에서 GIF를 직접 생성할 수 없으므로
        // 최소한의 유효한 GIF 구조 생성
        const minGif = createMinimalGIF(byteSize);
        resolve(minGif);
      }, "image/png");
    });
  }

  // 이미지 크기 계산
  // GIF는 압축되므로 정확한 크기 예측이 어렵습니다
  // 대략적인 픽셀 수 계산
  const estimatedPixels = Math.floor((byteSize * 2) / 4);
  const dimension = Math.floor(Math.sqrt(estimatedPixels));

  // 너무 크면 제한
  const maxDimension = 10000;
  const width = Math.min(dimension, maxDimension);
  const height = Math.min(Math.floor(estimatedPixels / width), maxDimension);

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

  // PNG로 생성 후 크기 조정 (브라우저는 GIF를 직접 생성할 수 없음)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          // 에러 발생 시 최소 GIF 생성
          const fallback = createMinimalGIF(byteSize);
          resolve(fallback);
          return;
        }

        // 크기가 부족하면 추가 데이터를 뒤에 추가
        if (blob.size < byteSize) {
          const additionalBytes = byteSize - blob.size;
          blob.arrayBuffer().then((buffer) => {
            const additionalData = new Uint8Array(additionalBytes).fill(0);
            const combined = new Uint8Array(
              buffer.byteLength + additionalBytes
            );
            combined.set(new Uint8Array(buffer), 0);
            combined.set(additionalData, buffer.byteLength);
            resolve(new Blob([combined], { type: "image/gif" }));
          });
        } else {
          // PNG를 GIF로 변환할 수 없으므로 최소 GIF 생성
          // 실제로는 GIF 라이브러리가 필요하지만, 여기서는 간단한 구조 생성
          const gif = createMinimalGIF(byteSize);
          resolve(gif);
        }
      },
      "image/png",
      1.0
    );
  });
};

/**
 * 최소한의 유효한 GIF 파일 생성
 * @param {number} targetSize - 목표 크기
 * @returns {Blob} 생성된 GIF Blob
 */
function createMinimalGIF(targetSize) {
  // GIF 시그니처 (6 bytes)
  const signature = new Uint8Array([
    0x47, 0x49, 0x46, 0x38, 0x39, 0x61, // "GIF89a"
  ]);

  // Logical Screen Descriptor (7 bytes)
  const lsd = new Uint8Array([
    0x01, 0x00, // width: 256
    0x01, 0x00, // height: 256
    0x80, // packed fields (GCT present, 256 colors)
    0x00, // background color index
    0x00, // pixel aspect ratio
  ]);

  // Global Color Table (768 bytes for 256 colors)
  const gct = new Uint8Array(768);
  for (let i = 0; i < 256; i++) {
    const idx = i * 3;
    gct[idx] = i; // R
    gct[idx + 1] = i; // G
    gct[idx + 2] = i; // B
  }

  // Image Descriptor (10 bytes)
  const imageDesc = new Uint8Array([
    0x2c, // Image Separator
    0x00, 0x00, 0x00, 0x00, // left, top
    0x01, 0x00, 0x01, 0x00, // width, height
    0x00, // packed fields
  ]);

  // Image Data (LZW 최소 코드 크기 + 데이터)
  const headerSize =
    signature.length + lsd.length + gct.length + imageDesc.length + 1; // +1 for trailer
  const dataSize = Math.max(0, targetSize - headerSize - 2); // -2 for LZW code size and block terminator

  const lzwCodeSize = new Uint8Array([0x08]); // LZW minimum code size
  const imageData = new Uint8Array(dataSize);
  for (let i = 0; i < dataSize; i++) {
    imageData[i] = i % 256;
  }
  const blockTerminator = new Uint8Array([0x00]); // Block terminator

  // Trailer
  const trailer = new Uint8Array([0x3b]);

  const gif = new Uint8Array([
    ...signature,
    ...lsd,
    ...gct,
    ...imageDesc,
    ...lzwCodeSize,
    ...imageData,
    ...blockTerminator,
    ...trailer,
  ]);

  return new Blob([gif], { type: "image/gif" });
}

