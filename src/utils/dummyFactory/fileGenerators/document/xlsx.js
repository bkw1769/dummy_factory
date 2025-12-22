/**
 * XLSX 파일 생성 함수
 * xlsx 라이브러리를 사용하여 실제 유효한 XLSX 파일 생성
 */
import { convertMBToBytes } from "../utils";
import * as XLSX from "xlsx";

/**
 * XLSX 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 XLSX Blob
 */
export const generateXLSX = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 XLSX 크기
  const minXLSXSize = 5000;
  if (byteSize < minXLSXSize) {
    // 최소 크기보다 작으면 최소 XLSX 생성
    const ws = XLSX.utils.aoa_to_sheet([["Dummy", "File"]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    const xlsxBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    return new Blob([xlsxBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  }

  // 행 수 계산
  const bytesPerRow = 500; // 대략적인 행당 바이트 수
  const rowsNeeded = Math.ceil(byteSize / bytesPerRow);
  const maxRows = 100000; // 최대 행 수 제한
  const actualRows = Math.min(rowsNeeded, maxRows);

  // 데이터 생성
  const data = [];
  data.push(["Column1", "Column2", "Column3", "Column4", "Column5"]); // 헤더

  for (let i = 0; i < actualRows; i++) {
    data.push([
      `Row${i + 1}_Col1`,
      `Row${i + 1}_Col2`,
      `Row${i + 1}_Col3`,
      `Row${i + 1}_Col4`,
      `Row${i + 1}_Col5_${"0".repeat(50)}`, // 긴 데이터로 크기 증가
    ]);
  }

  // 워크시트 생성
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  let xlsxBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });

  // 크기 조정
  if (xlsxBuffer.length < byteSize) {
    // 크기가 부족하면 추가 행 추가
    const additionalRows = Math.ceil((byteSize - xlsxBuffer.length) / bytesPerRow);
    const additionalData = [];
    for (let i = 0; i < additionalRows; i++) {
      additionalData.push([
        `Extra${i}_Col1`,
        `Extra${i}_Col2`,
        `Extra${i}_Col3`,
        `Extra${i}_Col4`,
        `Extra${i}_Col5_${"0".repeat(100)}`,
      ]);
    }
    const additionalWs = XLSX.utils.aoa_to_sheet(additionalData);
    XLSX.utils.book_append_sheet(wb, additionalWs, "Sheet2");
    xlsxBuffer = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  } else if (xlsxBuffer.length > byteSize) {
    // 크기가 초과하면 행 수 조정
    const scale = byteSize / xlsxBuffer.length;
    const newRows = Math.max(1, Math.floor(actualRows * scale));

    const newData = [];
    newData.push(["Column1", "Column2", "Column3", "Column4", "Column5"]);
    for (let i = 0; i < newRows; i++) {
      newData.push([
        `Row${i + 1}_Col1`,
        `Row${i + 1}_Col2`,
        `Row${i + 1}_Col3`,
        `Row${i + 1}_Col4`,
        `Row${i + 1}_Col5`,
      ]);
    }

    const newWs = XLSX.utils.aoa_to_sheet(newData);
    const newWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(newWb, newWs, "Sheet1");
    xlsxBuffer = XLSX.write(newWb, { type: "array", bookType: "xlsx" });
  }

  return new Blob([xlsxBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};

