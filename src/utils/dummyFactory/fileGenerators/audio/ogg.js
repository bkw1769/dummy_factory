/**
 * OGG 오디오 파일 생성 함수
 * Ogg 컨테이너 + Vorbis 코덱 헤더
 */
import { convertMBToBytes } from "../utils";

/**
 * CRC32 계산 (Ogg 페이지용)
 * @param {Uint8Array} data - 데이터
 * @returns {number} CRC32 값
 */
const crc32Ogg = (data) => {
  // Ogg CRC32 polynomial: 0x04c11db7
  const table = [];
  for (let i = 0; i < 256; i++) {
    let r = i << 24;
    for (let j = 0; j < 8; j++) {
      if (r & 0x80000000) {
        r = ((r << 1) ^ 0x04c11db7) >>> 0;
      } else {
        r = (r << 1) >>> 0;
      }
    }
    table[i] = r;
  }

  let crc = 0;
  for (let i = 0; i < data.length; i++) {
    crc = ((crc << 8) ^ table[((crc >>> 24) ^ data[i]) & 0xff]) >>> 0;
  }
  return crc;
};

/**
 * Ogg 페이지 생성
 * @param {number} granulePos - Granule position
 * @param {number} serialNo - Stream serial number
 * @param {number} pageNo - Page sequence number
 * @param {number} headerType - Header type flags
 * @param {Uint8Array} data - Page data
 * @returns {Uint8Array} Ogg page
 */
const createOggPage = (granulePos, serialNo, pageNo, headerType, data) => {
  // 세그먼트 테이블 생성
  const segments = [];
  let remaining = data.length;
  while (remaining > 0) {
    const segSize = Math.min(remaining, 255);
    segments.push(segSize);
    remaining -= segSize;
  }
  if (segments.length === 0 || segments[segments.length - 1] === 255) {
    segments.push(0);
  }

  const headerSize = 27 + segments.length;
  const page = new Uint8Array(headerSize + data.length);

  // Capture pattern "OggS"
  page[0] = 0x4f; // O
  page[1] = 0x67; // g
  page[2] = 0x67; // g
  page[3] = 0x53; // S

  // Version
  page[4] = 0;

  // Header type
  page[5] = headerType;

  // Granule position (64-bit)
  const granuleLow = granulePos & 0xffffffff;
  const granuleHigh = Math.floor(granulePos / 0x100000000) & 0xffffffff;
  page[6] = granuleLow & 0xff;
  page[7] = (granuleLow >> 8) & 0xff;
  page[8] = (granuleLow >> 16) & 0xff;
  page[9] = (granuleLow >> 24) & 0xff;
  page[10] = granuleHigh & 0xff;
  page[11] = (granuleHigh >> 8) & 0xff;
  page[12] = (granuleHigh >> 16) & 0xff;
  page[13] = (granuleHigh >> 24) & 0xff;

  // Serial number
  page[14] = serialNo & 0xff;
  page[15] = (serialNo >> 8) & 0xff;
  page[16] = (serialNo >> 16) & 0xff;
  page[17] = (serialNo >> 24) & 0xff;

  // Page sequence number
  page[18] = pageNo & 0xff;
  page[19] = (pageNo >> 8) & 0xff;
  page[20] = (pageNo >> 16) & 0xff;
  page[21] = (pageNo >> 24) & 0xff;

  // CRC (placeholder, will be calculated)
  page[22] = 0;
  page[23] = 0;
  page[24] = 0;
  page[25] = 0;

  // Number of segments
  page[26] = segments.length;

  // Segment table
  for (let i = 0; i < segments.length; i++) {
    page[27 + i] = segments[i];
  }

  // Page data
  page.set(data, headerSize);

  // Calculate CRC
  const crc = crc32Ogg(page);
  page[22] = crc & 0xff;
  page[23] = (crc >> 8) & 0xff;
  page[24] = (crc >> 16) & 0xff;
  page[25] = (crc >> 24) & 0xff;

  return page;
};

/**
 * OGG 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 OGG Blob
 */
export const generateOGG = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  const serialNo = 0x12345678;

  // Vorbis Identification Header
  const vorbisId = new Uint8Array([
    0x01, // Packet type (identification)
    0x76, 0x6f, 0x72, 0x62, 0x69, 0x73, // "vorbis"
    0x00, 0x00, 0x00, 0x00, // Vorbis version (0)
    0x02, // Audio channels (2 = stereo)
    0x44, 0xac, 0x00, 0x00, // Sample rate (44100)
    0x00, 0x00, 0x00, 0x00, // Bitrate maximum
    0x80, 0xbb, 0x00, 0x00, // Bitrate nominal (48000)
    0x00, 0x00, 0x00, 0x00, // Bitrate minimum
    0xb8, // blocksize 0 (256) and 1 (2048)
    0x01, // Framing flag
  ]);

  // Vorbis Comment Header
  const vendorString = "DummyFactory";
  const vendorBytes = new TextEncoder().encode(vendorString);
  const vorbisComment = new Uint8Array([
    0x03, // Packet type (comment)
    0x76, 0x6f, 0x72, 0x62, 0x69, 0x73, // "vorbis"
    vendorBytes.length & 0xff,
    (vendorBytes.length >> 8) & 0xff,
    (vendorBytes.length >> 16) & 0xff,
    (vendorBytes.length >> 24) & 0xff,
    ...vendorBytes,
    0x00, 0x00, 0x00, 0x00, // User comment list length (0)
    0x01, // Framing flag
  ]);

  // Vorbis Setup Header (minimal)
  const vorbisSetup = new Uint8Array([
    0x05, // Packet type (setup)
    0x76, 0x6f, 0x72, 0x62, 0x69, 0x73, // "vorbis"
    // Minimal codebook data
    0x06, // Number of codebooks - 1
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, // Codebook placeholder
    0x01, // Framing flag
  ]);

  // Create header pages
  const page0 = createOggPage(0, serialNo, 0, 0x02, vorbisId); // BOS
  const page1 = createOggPage(0, serialNo, 1, 0x00, vorbisComment);
  const page2 = createOggPage(0, serialNo, 2, 0x00, vorbisSetup);

  // Calculate remaining size for audio data
  const headerSize = page0.length + page1.length + page2.length;
  let audioDataSize = byteSize - headerSize - 100; // Reserve space for final page header
  if (audioDataSize < 0) audioDataSize = 0;

  // Create audio data pages (silence)
  const pages = [page0, page1, page2];
  let pageNo = 3;
  let granulePos = 0;
  const samplesPerPage = 4096;

  while (audioDataSize > 0) {
    const pageDataSize = Math.min(audioDataSize, 4096);
    const audioData = new Uint8Array(pageDataSize).fill(0);
    granulePos += samplesPerPage;

    const isLast = audioDataSize <= pageDataSize;
    const headerType = isLast ? 0x04 : 0x00; // EOS flag

    const page = createOggPage(granulePos, serialNo, pageNo, headerType, audioData);
    pages.push(page);
    pageNo++;
    audioDataSize -= pageDataSize;
  }

  // If no audio pages were created, add an empty EOS page
  if (pages.length === 3) {
    const eosPage = createOggPage(0, serialNo, 3, 0x04, new Uint8Array(0));
    pages.push(eosPage);
  }

  // Combine all pages
  const totalSize = pages.reduce((sum, page) => sum + page.length, 0);
  const oggFile = new Uint8Array(totalSize);
  let offset = 0;
  for (const page of pages) {
    oggFile.set(page, offset);
    offset += page.length;
  }

  return new Blob([oggFile], { type: "audio/ogg" });
};

/**
 * FLAC 파일 생성 (최소 유효 구조)
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 FLAC Blob
 */
export const generateFLAC = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // FLAC stream marker
  const marker = new Uint8Array([0x66, 0x4c, 0x61, 0x43]); // "fLaC"

  // STREAMINFO metadata block (mandatory, 34 bytes data)
  const streamInfo = new Uint8Array([
    0x80, // Last metadata block flag (1) + type (0 = STREAMINFO)
    0x00, 0x00, 0x22, // Length: 34 bytes
    // STREAMINFO data
    0x10, 0x00, // Minimum block size: 4096
    0x10, 0x00, // Maximum block size: 4096
    0x00, 0x00, 0x00, // Minimum frame size: 0 (unknown)
    0x00, 0x00, 0x00, // Maximum frame size: 0 (unknown)
    // Sample rate (44100), channels (2), bits per sample (16), total samples
    0x0a, 0xc4, 0x42, 0xf0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    // MD5 signature (16 bytes, all zeros)
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
  ]);

  // Calculate padding size
  const headerSize = marker.length + streamInfo.length;
  let paddingSize = byteSize - headerSize;
  if (paddingSize < 0) paddingSize = 0;

  // Create padding as frame data
  const paddingData = new Uint8Array(paddingSize).fill(0);

  // Combine
  const flacFile = new Uint8Array(headerSize + paddingSize);
  flacFile.set(marker, 0);
  flacFile.set(streamInfo, marker.length);
  flacFile.set(paddingData, headerSize);

  return new Blob([flacFile], { type: "audio/flac" });
};

/**
 * M4A 파일 생성 (AAC in MP4 container)
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @returns {Blob} 생성된 M4A Blob
 */
export const generateM4A = (sizeMB, unit = "auto") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // Helper functions
  const uint32BE = (value) => [
    (value >> 24) & 0xff,
    (value >> 16) & 0xff,
    (value >> 8) & 0xff,
    value & 0xff,
  ];
  const stringToBytes = (str) => str.split("").map((c) => c.charCodeAt(0));

  const createBox = (type, content) => {
    const size = 8 + content.length;
    return new Uint8Array([...uint32BE(size), ...stringToBytes(type), ...content]);
  };

  // ftyp box for M4A
  const ftypContent = new Uint8Array([
    ...stringToBytes("M4A "), // major brand
    ...uint32BE(0x200), // minor version
    ...stringToBytes("M4A "), // compatible brand
    ...stringToBytes("mp42"), // compatible brand
    ...stringToBytes("isom"), // compatible brand
  ]);
  const ftyp = createBox("ftyp", ftypContent);

  // Minimal moov box
  const moov = createBox("moov", new Uint8Array([
    // mvhd
    ...uint32BE(108), ...stringToBytes("mvhd"),
    0x00, 0x00, 0x00, 0x00, // version + flags
    ...uint32BE(0), // creation time
    ...uint32BE(0), // modification time
    ...uint32BE(44100), // timescale
    ...uint32BE(44100), // duration (1 second)
    0x00, 0x01, 0x00, 0x00, // rate
    0x01, 0x00, // volume
    ...new Array(70).fill(0), // reserved + matrix + pre_defined
    ...uint32BE(2), // next track ID
  ]));

  // mdat with padding
  const headerSize = ftyp.length + moov.length + 8;
  let mdatSize = byteSize - headerSize;
  if (mdatSize < 0) mdatSize = 0;

  const mdat = createBox("mdat", new Uint8Array(mdatSize).fill(0));

  // Combine
  const m4aFile = new Uint8Array(ftyp.length + moov.length + mdat.length);
  m4aFile.set(ftyp, 0);
  m4aFile.set(moov, ftyp.length);
  m4aFile.set(mdat, ftyp.length + moov.length);

  return new Blob([m4aFile], { type: "audio/mp4" });
};
