/**
 * WebM 비디오 파일 생성 함수
 * EBML (Matroska) 구조 기반
 */
import { convertMBToBytes } from "../utils";

/**
 * EBML Variable-Size Integer 인코딩
 * @param {number} value - 인코딩할 값
 * @param {number} width - 바이트 너비 (1-8)
 * @returns {number[]} 인코딩된 바이트 배열
 */
const encodeVInt = (value, width = null) => {
  if (width === null) {
    // 자동 너비 결정
    if (value < 0x7f - 1) width = 1;
    else if (value < 0x3fff - 1) width = 2;
    else if (value < 0x1fffff - 1) width = 3;
    else if (value < 0x0fffffff - 1) width = 4;
    else width = 8;
  }

  const result = [];
  const marker = 0x80 >> (width - 1);

  for (let i = width - 1; i >= 0; i--) {
    result.push((value >> (i * 8)) & 0xff);
  }
  result[0] |= marker;

  return result;
};

/**
 * EBML Element 생성
 * @param {number[]} id - Element ID
 * @param {number[]|Uint8Array} data - Element 데이터
 * @returns {Uint8Array} 생성된 Element
 */
const createEBMLElement = (id, data) => {
  const dataArray = data instanceof Uint8Array ? [...data] : data;
  const size = encodeVInt(dataArray.length);
  return new Uint8Array([...id, ...size, ...dataArray]);
};

/**
 * 문자열을 바이트 배열로 변환
 * @param {string} str - 변환할 문자열
 * @returns {number[]} 바이트 배열
 */
const stringToBytes = (str) => str.split("").map((c) => c.charCodeAt(0));

/**
 * 숫자를 빅 엔디안 바이트 배열로 변환
 * @param {number} value - 변환할 값
 * @param {number} bytes - 바이트 수
 * @returns {number[]} 바이트 배열
 */
const numberToBytes = (value, bytes) => {
  const result = [];
  for (let i = bytes - 1; i >= 0; i--) {
    result.push((value >> (i * 8)) & 0xff);
  }
  return result;
};

/**
 * WebM 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 WebM Blob
 */
export const generateWebM = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // EBML Element IDs
  const EBML_ID = [0x1a, 0x45, 0xdf, 0xa3];
  const EBML_VERSION = [0x42, 0x86];
  const EBML_READ_VERSION = [0x42, 0xf7];
  const EBML_MAX_ID_LENGTH = [0x42, 0xf2];
  const EBML_MAX_SIZE_LENGTH = [0x42, 0xf3];
  const DOC_TYPE = [0x42, 0x82];
  const DOC_TYPE_VERSION = [0x42, 0x87];
  const DOC_TYPE_READ_VERSION = [0x42, 0x85];

  const SEGMENT = [0x18, 0x53, 0x80, 0x67];
  const SEEK_HEAD = [0x11, 0x4d, 0x9b, 0x74];
  const INFO = [0x15, 0x49, 0xa9, 0x66];
  const TIMECODE_SCALE = [0x2a, 0xd7, 0xb1];
  const MUXING_APP = [0x4d, 0x80];
  const WRITING_APP = [0x57, 0x41];
  const DURATION = [0x44, 0x89];

  const TRACKS = [0x16, 0x54, 0xae, 0x6b];
  const TRACK_ENTRY = [0xae];
  const TRACK_NUMBER = [0xd7];
  const TRACK_UID = [0x73, 0xc5];
  const TRACK_TYPE = [0x83];
  const CODEC_ID = [0x86];
  const VIDEO = [0xe0];
  const PIXEL_WIDTH = [0xb0];
  const PIXEL_HEIGHT = [0xba];

  const CLUSTER = [0x1f, 0x43, 0xb6, 0x75];
  const TIMECODE = [0xe7];
  const SIMPLE_BLOCK = [0xa3];

  // 비디오 설정
  const width = 320;
  const height = 240;
  const timecodeScale = 1000000; // 나노초
  const duration = 1000.0; // 밀리초

  // EBML Header
  const ebmlVersion = createEBMLElement(EBML_VERSION, [1]);
  const ebmlReadVersion = createEBMLElement(EBML_READ_VERSION, [1]);
  const ebmlMaxIdLength = createEBMLElement(EBML_MAX_ID_LENGTH, [4]);
  const ebmlMaxSizeLength = createEBMLElement(EBML_MAX_SIZE_LENGTH, [8]);
  const docType = createEBMLElement(DOC_TYPE, stringToBytes("webm"));
  const docTypeVersion = createEBMLElement(DOC_TYPE_VERSION, [4]);
  const docTypeReadVersion = createEBMLElement(DOC_TYPE_READ_VERSION, [2]);

  const ebmlHeaderContent = new Uint8Array([
    ...ebmlVersion,
    ...ebmlReadVersion,
    ...ebmlMaxIdLength,
    ...ebmlMaxSizeLength,
    ...docType,
    ...docTypeVersion,
    ...docTypeReadVersion,
  ]);
  const ebmlHeader = createEBMLElement(EBML_ID, ebmlHeaderContent);

  // Segment Info
  const timecodeScaleEl = createEBMLElement(TIMECODE_SCALE, numberToBytes(timecodeScale, 4));
  const muxingApp = createEBMLElement(MUXING_APP, stringToBytes("DummyFactory"));
  const writingApp = createEBMLElement(WRITING_APP, stringToBytes("DummyFactory"));
  // Duration as float (8 bytes)
  const durationBytes = new Uint8Array(new Float64Array([duration]).buffer).reverse();
  const durationEl = createEBMLElement(DURATION, [...durationBytes]);

  const infoContent = new Uint8Array([
    ...timecodeScaleEl,
    ...muxingApp,
    ...writingApp,
    ...durationEl,
  ]);
  const info = createEBMLElement(INFO, infoContent);

  // Tracks
  const trackNumber = createEBMLElement(TRACK_NUMBER, [1]);
  const trackUid = createEBMLElement(TRACK_UID, numberToBytes(1, 4));
  const trackType = createEBMLElement(TRACK_TYPE, [1]); // 1 = video
  const codecId = createEBMLElement(CODEC_ID, stringToBytes("V_VP8"));
  const pixelWidth = createEBMLElement(PIXEL_WIDTH, numberToBytes(width, 2));
  const pixelHeight = createEBMLElement(PIXEL_HEIGHT, numberToBytes(height, 2));

  const videoContent = new Uint8Array([...pixelWidth, ...pixelHeight]);
  const videoEl = createEBMLElement(VIDEO, videoContent);

  const trackEntryContent = new Uint8Array([
    ...trackNumber,
    ...trackUid,
    ...trackType,
    ...codecId,
    ...videoEl,
  ]);
  const trackEntry = createEBMLElement(TRACK_ENTRY, trackEntryContent);
  const tracks = createEBMLElement(TRACKS, trackEntry);

  // 헤더 크기 계산
  const headerSize = ebmlHeader.length + 8 + info.length + tracks.length + 12; // Segment header + Cluster header

  // Cluster 데이터 크기 계산
  let clusterDataSize = byteSize - headerSize;
  if (clusterDataSize < 100) clusterDataSize = 100;

  // Simple Block (최소 유효 블록)
  const simpleBlockHeader = [
    0x81, // Track number (VINT: track 1)
    0x00, 0x00, // Timecode (relative to cluster)
    0x80, // Flags (keyframe)
  ];
  const frameDataSize = Math.max(0, clusterDataSize - 20); // Account for cluster overhead
  const frameData = new Uint8Array(frameDataSize);
  // 단색 프레임 패턴
  for (let i = 0; i < frameDataSize; i++) {
    frameData[i] = (i % 3 === 0) ? 0x00 : (i % 3 === 1) ? 0x00 : 0x80;
  }

  const simpleBlockContent = new Uint8Array([...simpleBlockHeader, ...frameData]);
  const simpleBlock = createEBMLElement(SIMPLE_BLOCK, simpleBlockContent);

  // Cluster
  const timecode = createEBMLElement(TIMECODE, [0]); // Timecode 0
  const clusterContent = new Uint8Array([...timecode, ...simpleBlock]);
  const cluster = createEBMLElement(CLUSTER, clusterContent);

  // Segment (unknown size marker for streaming)
  const segmentContent = new Uint8Array([...info, ...tracks, ...cluster]);
  // Segment with calculated size
  const segmentSize = encodeVInt(segmentContent.length, 8);
  const segment = new Uint8Array([...SEGMENT, ...segmentSize, ...segmentContent]);

  // 최종 파일 조립
  const webmFile = new Uint8Array([...ebmlHeader, ...segment]);

  return new Blob([webmFile], { type: "video/webm" });
};

/**
 * MKV 파일 생성 (WebM과 유사한 Matroska 구조)
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 MKV Blob
 */
export const generateMKV = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // EBML Element IDs
  const EBML_ID = [0x1a, 0x45, 0xdf, 0xa3];
  const EBML_VERSION = [0x42, 0x86];
  const EBML_READ_VERSION = [0x42, 0xf7];
  const EBML_MAX_ID_LENGTH = [0x42, 0xf2];
  const EBML_MAX_SIZE_LENGTH = [0x42, 0xf3];
  const DOC_TYPE = [0x42, 0x82];
  const DOC_TYPE_VERSION = [0x42, 0x87];
  const DOC_TYPE_READ_VERSION = [0x42, 0x85];
  const SEGMENT = [0x18, 0x53, 0x80, 0x67];
  const VOID = [0xec];

  // EBML Header for Matroska
  const ebmlVersion = createEBMLElement(EBML_VERSION, [1]);
  const ebmlReadVersion = createEBMLElement(EBML_READ_VERSION, [1]);
  const ebmlMaxIdLength = createEBMLElement(EBML_MAX_ID_LENGTH, [4]);
  const ebmlMaxSizeLength = createEBMLElement(EBML_MAX_SIZE_LENGTH, [8]);
  const docType = createEBMLElement(DOC_TYPE, stringToBytes("matroska"));
  const docTypeVersion = createEBMLElement(DOC_TYPE_VERSION, [4]);
  const docTypeReadVersion = createEBMLElement(DOC_TYPE_READ_VERSION, [2]);

  const ebmlHeaderContent = new Uint8Array([
    ...ebmlVersion,
    ...ebmlReadVersion,
    ...ebmlMaxIdLength,
    ...ebmlMaxSizeLength,
    ...docType,
    ...docTypeVersion,
    ...docTypeReadVersion,
  ]);
  const ebmlHeader = createEBMLElement(EBML_ID, ebmlHeaderContent);

  // Void element for padding
  const headerSize = ebmlHeader.length + 12; // + Segment header
  let voidSize = byteSize - headerSize - 4; // -4 for Void element header
  if (voidSize < 0) voidSize = 0;

  const voidData = new Uint8Array(voidSize).fill(0);
  const voidElement = createEBMLElement(VOID, voidData);

  // Segment
  const segmentSize = encodeVInt(voidElement.length, 8);
  const segment = new Uint8Array([...SEGMENT, ...segmentSize, ...voidElement]);

  // 최종 파일 조립
  const mkvFile = new Uint8Array([...ebmlHeader, ...segment]);

  return new Blob([mkvFile], { type: "video/x-matroska" });
};
