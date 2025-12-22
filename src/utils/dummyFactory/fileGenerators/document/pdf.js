/**
 * PDF 파일 생성 함수
 * pdf-lib 라이브러리를 사용하여 실제 유효한 PDF 파일 생성
 */
import { convertMBToBytes } from "../utils";
import { PDFDocument, rgb } from "pdf-lib";

/**
 * PDF 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 PDF Blob
 */
export const generatePDF = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 PDF 크기
  const minPDFSize = 500;
  if (byteSize < minPDFSize) {
    // 최소 크기보다 작으면 최소 PDF 생성
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    page.drawText("Dummy File", {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0, 0, 0),
    });
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  // PDF 문서 생성
  const pdfDoc = await PDFDocument.create();
  
  // 페이지 크기 계산 (대략적으로)
  // PDF는 텍스트와 이미지로 크기를 조정할 수 있음
  const pageSize = [612, 792]; // Letter size (8.5 x 11 inches)
  const bytesPerPage = 5000; // 대략적인 페이지당 바이트 수
  const pagesNeeded = Math.ceil(byteSize / bytesPerPage);
  const maxPages = 10000; // 최대 페이지 수 제한
  const actualPages = Math.min(pagesNeeded, maxPages);

  // 페이지 추가 및 콘텐츠 채우기
  for (let i = 0; i < actualPages; i++) {
    const page = pdfDoc.addPage(pageSize);
    const pageNumber = i + 1;
    
    // 페이지 번호 표시
    page.drawText(`Page ${pageNumber}`, {
      x: 50,
      y: 750,
      size: 12,
      color: rgb(0, 0, 0),
    });

    // 텍스트로 페이지 채우기
    const linesPerPage = 40;
    for (let j = 0; j < linesPerPage; j++) {
      const y = 700 - j * 15;
      const text = `Line ${j + 1} of page ${pageNumber}. Dummy content: ${"0".repeat(50)}`;
      page.drawText(text, {
        x: 50,
        y: y,
        size: 10,
        color: rgb(0.2, 0.2, 0.2),
      });
    }
  }

  // PDF 저장
  let pdfBytes = await pdfDoc.save();

  // 크기가 부족하면 추가 데이터 추가
  if (pdfBytes.length < byteSize) {
    const additionalBytes = byteSize - pdfBytes.length;
    const additionalData = new Uint8Array(additionalBytes).fill(0);
    const combined = new Uint8Array(pdfBytes.length + additionalBytes);
    combined.set(pdfBytes, 0);
    combined.set(additionalData, pdfBytes.length);
    return new Blob([combined], { type: "application/pdf" });
  } else if (pdfBytes.length > byteSize) {
    // 크기가 초과하면 페이지 수 조정
    const scale = byteSize / pdfBytes.length;
    const newPages = Math.max(1, Math.floor(actualPages * scale));
    
    const newPdfDoc = await PDFDocument.create();
    for (let i = 0; i < newPages; i++) {
      const page = newPdfDoc.addPage(pageSize);
      page.drawText(`Page ${i + 1}`, {
        x: 50,
        y: 750,
        size: 12,
        color: rgb(0, 0, 0),
      });
      
      const linesPerPage = Math.floor(40 * scale);
      for (let j = 0; j < linesPerPage; j++) {
        const y = 700 - j * 15;
        const text = `Line ${j + 1}. ${"0".repeat(30)}`;
        page.drawText(text, {
          x: 50,
          y: y,
          size: 10,
          color: rgb(0.2, 0.2, 0.2),
        });
      }
    }
    
    pdfBytes = await newPdfDoc.save();
  }

  return new Blob([pdfBytes], { type: "application/pdf" });
};

