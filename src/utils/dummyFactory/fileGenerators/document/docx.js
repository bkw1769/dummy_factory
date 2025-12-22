/**
 * DOCX 파일 생성 함수
 * docx 라이브러리를 사용하여 실제 유효한 DOCX 파일 생성
 */
import { convertMBToBytes } from "../utils";
import { Document, Packer, Paragraph, TextRun } from "docx";

/**
 * DOCX 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 DOCX Blob
 */
export const generateDOCX = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 DOCX 크기
  const minDOCXSize = 5000;
  if (byteSize < minDOCXSize) {
    // 최소 크기보다 작으면 최소 DOCX 생성
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun("Dummy File")],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBlob(doc);
    return buffer;
  }

  // 단락 수 계산
  const bytesPerParagraph = 200; // 대략적인 단락당 바이트 수
  const paragraphsNeeded = Math.ceil(byteSize / bytesPerParagraph);
  const maxParagraphs = 100000; // 최대 단락 수 제한
  const actualParagraphs = Math.min(paragraphsNeeded, maxParagraphs);

  // 단락 생성
  const children = [];
  for (let i = 0; i < actualParagraphs; i++) {
    const text = `Paragraph ${i + 1}. Dummy content: ${"0".repeat(100)}`;
    children.push(
      new Paragraph({
        children: [new TextRun(text)],
      })
    );
  }

  // DOCX 문서 생성
  const doc = new Document({
    sections: [
      {
        children: children,
      },
    ],
  });

  let buffer = await Packer.toBlob(doc);

  // 크기가 부족하면 추가 데이터 추가
  if (buffer.size < byteSize) {
    const additionalBytes = byteSize - buffer.size;
    const bufferArray = await buffer.arrayBuffer();
    const additionalData = new Uint8Array(additionalBytes).fill(0);
    const combined = new Uint8Array(bufferArray.byteLength + additionalBytes);
    combined.set(new Uint8Array(bufferArray), 0);
    combined.set(additionalData, bufferArray.byteLength);
    return new Blob([combined], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
  } else if (buffer.size > byteSize) {
    // 크기가 초과하면 단락 수 조정
    const scale = byteSize / buffer.size;
    const newParagraphs = Math.max(1, Math.floor(actualParagraphs * scale));

    const newChildren = [];
    for (let i = 0; i < newParagraphs; i++) {
      const text = `Paragraph ${i + 1}. ${"0".repeat(50)}`;
      newChildren.push(
        new Paragraph({
          children: [new TextRun(text)],
        })
      );
    }

    const newDoc = new Document({
      sections: [
        {
          children: newChildren,
        },
      ],
    });

    buffer = await Packer.toBlob(newDoc);
  }

  return buffer;
};

