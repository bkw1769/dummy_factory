/**
 * PPTX 파일 생성 함수
 * jszip을 사용하여 간단한 PPTX 구조 생성
 */
import { convertMBToBytes } from "../utils";
import JSZip from "jszip";

/**
 * PPTX 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Promise<Blob>} 생성된 PPTX Blob
 */
export const generatePPTX = async (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 최소 PPTX 크기
  const minPPTXSize = 5000;
  if (byteSize < minPPTXSize) {
    const zip = new JSZip();
    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
</Types>`);
    zip.file("ppt/presentation.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst><p:sldId id="256" r:id="rId2"/></p:sldIdLst>
</p:presentation>`);
    const blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
    return blob;
  }

  const zip = new JSZip();

  // [Content_Types].xml
  zip.file(
    "[Content_Types].xml",
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
</Types>`
  );

  // ppt/presentation.xml
  const slideCount = Math.floor(byteSize / 10000);
  let presentationXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:sldMasterIdLst><p:sldMasterId r:id="rId1"/></p:sldMasterIdLst>
  <p:sldIdLst>`;
  
  for (let i = 0; i < slideCount; i++) {
    presentationXml += `<p:sldId id="${256 + i}" r:id="rId${i + 2}"/>`;
  }
  
  presentationXml += `</p:sldIdLst>
</p:presentation>`;

  zip.file("ppt/presentation.xml", presentationXml);

  // 더미 데이터로 크기 맞추기
  const dummyContent = "0".repeat(Math.floor(byteSize / 2));
  zip.file("dummy.txt", dummyContent);

  let blob = await zip.generateAsync({ type: "blob", compression: "STORE" });

  // 크기 조정
  if (blob.size < byteSize) {
    const additionalBytes = byteSize - blob.size;
    const additionalData = "0".repeat(additionalBytes);
    zip.file("additional.txt", additionalData);
    blob = await zip.generateAsync({ type: "blob", compression: "STORE" });
  } else if (blob.size > byteSize) {
    const scale = byteSize / blob.size;
    const newDummyContent = "0".repeat(Math.floor(dummyContent.length * scale));
    const newZip = new JSZip();
    newZip.file("[Content_Types].xml", zip.files["[Content_Types].xml"]._data);
    newZip.file("ppt/presentation.xml", presentationXml);
    newZip.file("dummy.txt", newDummyContent);
    blob = await newZip.generateAsync({ type: "blob", compression: "STORE" });
  }

  return blob;
};

