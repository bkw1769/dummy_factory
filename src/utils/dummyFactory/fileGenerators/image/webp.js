/**
 * WebP 이미지 파일 생성 함수
 * Canvas API를 사용하여 실제 유효한 WebP 파일 생성
 */
import { convertMBToBytes } from "../utils";

/**
 * WebP 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 WebP Blob
 */
export const generateWebP = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 WebP 크기
  const minWebPSize = 100;
  if (byteSize < minWebPSize) {
    // 최소 크기보다 작으면 1x1 픽셀 WebP 생성
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, 1, 1);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob([], { type: "image/webp" }));
      }, "image/webp", 1.0);
    });
  }

  // 이미지 크기 계산
  // WebP는 압축되므로 정확한 크기 예측이 어렵습니다
  // 대략적인 픽셀 수 계산 (RGBA, 4 bytes per pixel + 압축률 고려)
  // WebP 압축률을 50%로 가정
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

  // WebP로 변환 (품질 조정하여 크기 맞추기)
  return new Promise((resolve) => {
    let quality = 1.0; // 최고 품질부터 시작

    const tryGenerate = () => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // 에러 발생 시 기본 바이너리 생성으로 폴백
            const fallback = new Uint8Array(byteSize).fill(0);
            resolve(new Blob([fallback], { type: "image/webp" }));
            return;
          }

          // 크기가 부족하면 추가 데이터를 WebP 뒤에 추가
          if (blob.size < byteSize) {
            const additionalBytes = byteSize - blob.size;
            blob.arrayBuffer().then((buffer) => {
              const additionalData = new Uint8Array(additionalBytes).fill(0);
              const combined = new Uint8Array(
                buffer.byteLength + additionalBytes
              );
              combined.set(new Uint8Array(buffer), 0);
              combined.set(additionalData, buffer.byteLength);
              resolve(new Blob([combined], { type: "image/webp" }));
            });
          } else if (blob.size > byteSize) {
            // 크기가 초과하면 품질을 낮춰서 재시도
            quality = Math.max(0.1, quality - 0.1);
            if (quality >= 0.1) {
              tryGenerate();
            } else {
              // 품질을 낮춰도 크기가 초과하면 이미지 크기 조정
              const scale = Math.sqrt(byteSize / blob.size);
              const newWidth = Math.floor(width * scale);
              const newHeight = Math.floor(height * scale);

              if (newWidth > 0 && newHeight > 0) {
                const newCanvas = document.createElement("canvas");
                newCanvas.width = newWidth;
                newCanvas.height = newHeight;
                const newCtx = newCanvas.getContext("2d");

                const newImageData = newCtx.createImageData(
                  newWidth,
                  newHeight
                );
                for (let y = 0; y < newHeight; y++) {
                  for (let x = 0; x < newWidth; x++) {
                    const idx = (y * newWidth + x) * 4;
                    const value = (x + y) % 256;
                    newImageData.data[idx] = value;
                    newImageData.data[idx + 1] = value;
                    newImageData.data[idx + 2] = value;
                    newImageData.data[idx + 3] = 255;
                  }
                }
                newCtx.putImageData(newImageData, 0, 0);

                newCanvas.toBlob((newBlob) => {
                  resolve(newBlob || blob);
                }, "image/webp", 0.5);
              } else {
                resolve(blob);
              }
            }
          } else {
            resolve(blob);
          }
        },
        "image/webp",
        quality
      );
    };

    tryGenerate();
  });
};

