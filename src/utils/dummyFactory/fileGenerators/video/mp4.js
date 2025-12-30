/**
 * MP4 비디오 파일 생성 함수
 * ISO Base Media File Format (ISO BMFF) 구조
 */
import { convertMBToBytes } from "../utils";

/**
 * 문자열을 바이트 배열로 변환
 * @param {string} str - 변환할 문자열
 * @returns {number[]} 바이트 배열
 */
const stringToBytes = (str) => str.split("").map((c) => c.charCodeAt(0));

/**
 * 32비트 빅 엔디안 값을 바이트 배열로 변환
 * @param {number} value - 변환할 값
 * @returns {number[]} 4바이트 배열
 */
const uint32BE = (value) => [
  (value >> 24) & 0xff,
  (value >> 16) & 0xff,
  (value >> 8) & 0xff,
  value & 0xff,
];

/**
 * 16비트 빅 엔디안 값을 바이트 배열로 변환
 * @param {number} value - 변환할 값
 * @returns {number[]} 2바이트 배열
 */
const uint16BE = (value) => [(value >> 8) & 0xff, value & 0xff];

/**
 * Box 생성 헬퍼
 * @param {string} type - Box 타입 (4글자)
 * @param {Uint8Array} content - Box 내용
 * @returns {Uint8Array} 생성된 Box
 */
const createBox = (type, content) => {
  const size = 8 + content.length;
  return new Uint8Array([...uint32BE(size), ...stringToBytes(type), ...content]);
};

/**
 * Full Box 생성 헬퍼 (version + flags 포함)
 * @param {string} type - Box 타입
 * @param {number} version - 버전
 * @param {number} flags - 플래그
 * @param {Uint8Array} content - 내용
 * @returns {Uint8Array} 생성된 Full Box
 */
const createFullBox = (type, version, flags, content) => {
  const fullContent = new Uint8Array([
    version,
    (flags >> 16) & 0xff,
    (flags >> 8) & 0xff,
    flags & 0xff,
    ...content,
  ]);
  return createBox(type, fullContent);
};

/**
 * MP4 파일 생성
 * @param {number} sizeMB - 파일 크기 (MB)
 * @param {string} unit - 단위 ('binary' | 'decimal' | 'auto')
 * @param {string} brand - 파일 브랜드 ('isom' | 'qt  ')
 * @returns {Blob} 생성된 MP4 Blob
 */
export const generateMP4 = (sizeMB, unit = "auto", brand = "isom") => {
  const byteSize = convertMBToBytes(sizeMB, unit);

  // 비디오 설정
  const width = 320;
  const height = 240;
  const timescale = 1000;
  const duration = 1000; // 1초

  // ftyp Box
  const ftypContent = new Uint8Array([
    ...stringToBytes(brand), // major brand
    ...uint32BE(0x200), // minor version
    ...stringToBytes("isom"), // compatible brand
    ...stringToBytes("iso2"), // compatible brand
    ...stringToBytes("mp41"), // compatible brand
  ]);
  const ftyp = createBox("ftyp", ftypContent);

  // mvhd (Movie Header Box)
  const mvhd = createFullBox(
    "mvhd",
    0,
    0,
    new Uint8Array([
      ...uint32BE(0), // creation time
      ...uint32BE(0), // modification time
      ...uint32BE(timescale), // timescale
      ...uint32BE(duration), // duration
      0x00, 0x01, 0x00, 0x00, // rate (1.0)
      0x01, 0x00, // volume (1.0)
      0x00, 0x00, // reserved
      ...new Array(8).fill(0), // reserved
      // matrix (identity)
      ...uint32BE(0x00010000), 0, 0, 0, 0,
      ...uint32BE(0x00010000), 0, 0, 0, 0,
      ...uint32BE(0x40000000),
      ...new Array(24).fill(0), // pre-defined
      ...uint32BE(2), // next track ID
    ])
  );

  // tkhd (Track Header Box)
  const tkhd = createFullBox(
    "tkhd",
    0,
    0x03, // flags: enabled, in movie
    new Uint8Array([
      ...uint32BE(0), // creation time
      ...uint32BE(0), // modification time
      ...uint32BE(1), // track ID
      ...uint32BE(0), // reserved
      ...uint32BE(duration), // duration
      ...new Array(8).fill(0), // reserved
      ...uint16BE(0), // layer
      ...uint16BE(0), // alternate group
      ...uint16BE(0), // volume
      ...uint16BE(0), // reserved
      // matrix (identity)
      ...uint32BE(0x00010000), ...uint32BE(0), ...uint32BE(0),
      ...uint32BE(0), ...uint32BE(0x00010000), ...uint32BE(0),
      ...uint32BE(0), ...uint32BE(0), ...uint32BE(0x40000000),
      ...uint32BE(width << 16), // width (fixed point)
      ...uint32BE(height << 16), // height (fixed point)
    ])
  );

  // mdhd (Media Header Box)
  const mdhd = createFullBox(
    "mdhd",
    0,
    0,
    new Uint8Array([
      ...uint32BE(0), // creation time
      ...uint32BE(0), // modification time
      ...uint32BE(timescale), // timescale
      ...uint32BE(duration), // duration
      ...uint16BE(0x55c4), // language (und)
      ...uint16BE(0), // pre-defined
    ])
  );

  // hdlr (Handler Reference Box)
  const hdlr = createFullBox(
    "hdlr",
    0,
    0,
    new Uint8Array([
      ...uint32BE(0), // pre-defined
      ...stringToBytes("vide"), // handler type
      ...new Array(12).fill(0), // reserved
      ...stringToBytes("VideoHandler"), 0, // name (null-terminated)
    ])
  );

  // vmhd (Video Media Header Box)
  const vmhd = createFullBox(
    "vmhd",
    0,
    1, // flags
    new Uint8Array([
      ...uint16BE(0), // graphics mode
      ...uint16BE(0), // opcolor
      ...uint16BE(0),
      ...uint16BE(0),
    ])
  );

  // dref (Data Reference Box)
  const drefEntry = createFullBox(
    "url ",
    0,
    1, // flags: self-contained
    new Uint8Array([])
  );
  const dref = createFullBox(
    "dref",
    0,
    0,
    new Uint8Array([...uint32BE(1), ...drefEntry]) // entry count + entries
  );

  // dinf (Data Information Box)
  const dinf = createBox("dinf", dref);

  // stsd (Sample Description Box) - 비압축 비디오
  const visualSampleEntry = new Uint8Array([
    ...uint32BE(86 + 8), // size
    ...stringToBytes("avc1"), // format (using avc1 for compatibility)
    ...new Array(6).fill(0), // reserved
    ...uint16BE(1), // data reference index
    ...uint16BE(0), // pre-defined
    ...uint16BE(0), // reserved
    ...new Array(12).fill(0), // pre-defined
    ...uint16BE(width), // width
    ...uint16BE(height), // height
    ...uint32BE(0x00480000), // horizontal resolution (72 dpi)
    ...uint32BE(0x00480000), // vertical resolution (72 dpi)
    ...uint32BE(0), // reserved
    ...uint16BE(1), // frame count
    ...new Array(32).fill(0), // compressor name
    ...uint16BE(24), // depth
    ...uint16BE(-1), // pre-defined
  ]);
  const stsd = createFullBox(
    "stsd",
    0,
    0,
    new Uint8Array([...uint32BE(1), ...visualSampleEntry]) // entry count
  );

  // stts (Time to Sample Box)
  const stts = createFullBox(
    "stts",
    0,
    0,
    new Uint8Array([
      ...uint32BE(1), // entry count
      ...uint32BE(1), // sample count
      ...uint32BE(duration), // sample delta
    ])
  );

  // stsc (Sample to Chunk Box)
  const stsc = createFullBox(
    "stsc",
    0,
    0,
    new Uint8Array([
      ...uint32BE(1), // entry count
      ...uint32BE(1), // first chunk
      ...uint32BE(1), // samples per chunk
      ...uint32BE(1), // sample description index
    ])
  );

  // stsz (Sample Size Box)
  const sampleSize = width * height * 3; // RGB
  const stsz = createFullBox(
    "stsz",
    0,
    0,
    new Uint8Array([
      ...uint32BE(sampleSize), // sample size (uniform)
      ...uint32BE(1), // sample count
    ])
  );

  // stco (Chunk Offset Box) - 나중에 업데이트 필요
  const stco = createFullBox(
    "stco",
    0,
    0,
    new Uint8Array([
      ...uint32BE(1), // entry count
      ...uint32BE(0), // chunk offset (placeholder)
    ])
  );

  // stbl (Sample Table Box)
  const stbl = createBox(
    "stbl",
    new Uint8Array([...stsd, ...stts, ...stsc, ...stsz, ...stco])
  );

  // minf (Media Information Box)
  const minf = createBox("minf", new Uint8Array([...vmhd, ...dinf, ...stbl]));

  // mdia (Media Box)
  const mdia = createBox("mdia", new Uint8Array([...mdhd, ...hdlr, ...minf]));

  // trak (Track Box)
  const trak = createBox("trak", new Uint8Array([...tkhd, ...mdia]));

  // moov (Movie Box)
  const moov = createBox("moov", new Uint8Array([...mvhd, ...trak]));

  // mdat 크기 계산
  const headerSize = ftyp.length + moov.length + 8; // +8 for mdat header
  let mdatDataSize = byteSize - headerSize;
  if (mdatDataSize < sampleSize) {
    mdatDataSize = sampleSize;
  }

  // mdat Box (Media Data)
  const mdatData = new Uint8Array(mdatDataSize);
  // 단색 프레임 데이터 (파란색)
  for (let i = 0; i < Math.min(sampleSize, mdatDataSize); i += 3) {
    mdatData[i] = 0x00; // R
    mdatData[i + 1] = 0x00; // G
    mdatData[i + 2] = 0x80; // B
  }
  const mdat = createBox("mdat", mdatData);

  // stco 오프셋 업데이트 (ftyp + moov + mdat header)
  const mdatOffset = ftyp.length + moov.length + 8;

  // moov 재생성 with correct stco offset
  const stcoUpdated = createFullBox(
    "stco",
    0,
    0,
    new Uint8Array([
      ...uint32BE(1), // entry count
      ...uint32BE(mdatOffset), // chunk offset
    ])
  );

  const stblUpdated = createBox(
    "stbl",
    new Uint8Array([...stsd, ...stts, ...stsc, ...stsz, ...stcoUpdated])
  );
  const minfUpdated = createBox(
    "minf",
    new Uint8Array([...vmhd, ...dinf, ...stblUpdated])
  );
  const mdiaUpdated = createBox(
    "mdia",
    new Uint8Array([...mdhd, ...hdlr, ...minfUpdated])
  );
  const trakUpdated = createBox(
    "trak",
    new Uint8Array([...tkhd, ...mdiaUpdated])
  );
  const moovUpdated = createBox(
    "moov",
    new Uint8Array([...mvhd, ...trakUpdated])
  );

  // 최종 파일 조립
  const mp4File = new Uint8Array([...ftyp, ...moovUpdated, ...mdat]);

  const mimeType = brand === "qt  " ? "video/quicktime" : "video/mp4";
  return new Blob([mp4File], { type: mimeType });
};

/**
 * GIFV 파일 생성 (MP4와 동일)
 */
export const generateGIFV = (sizeMB, unit = "auto") => {
  return generateMP4(sizeMB, unit, "isom");
};
