/**
 * 파일 생성 함수 인덱스
 * 모든 파일 형식별 생성 함수를 export
 */

// 텍스트 기반 파일
export { generateJSON } from "./text/json";
export { generateCSV } from "./text/csv";
export { generateXML } from "./text/xml";
export { generateHTML } from "./text/html";
export {
  generateTXT,
  generateMD,
  generateCSS,
  generateJS,
  generateYAML,
  generateSQL,
} from "./text/plain";

// 이미지 파일
export { generatePNG } from "./image/png";
export { generateJPEG } from "./image/jpeg";
export { generateGIF } from "./image/gif";
export { generateWebP } from "./image/webp";
export { generateSVG } from "./image/svg";
export { generateBMP } from "./image/bmp";
export { generateICO } from "./image/ico";
export { generateTIFF } from "./image/tiff";

// 오디오 파일
export { generateWAV, generateOGG, generateFLAC, generateM4A } from "./audio";

// 비디오 파일
export {
  generateAVI,
  generateMP4,
  generateMOV,
  generateWebM,
  generateMKV,
  generateGIFV,
} from "./video";

// 문서 파일
export {
  generatePDF,
  generateDOC,
  generateDOCX,
  generatePPT,
  generatePPTX,
  generateXLS,
  generateXLSX,
  generateRTF,
} from "./document";

// 압축 파일
export { generateZIP, generateTAR, generateGZ, generateTGZ } from "./archive";

