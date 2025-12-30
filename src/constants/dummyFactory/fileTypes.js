import {
  FileImage,
  Film,
  Mic,
  FileText,
  Database,
  Archive,
} from "lucide-react";

/**
 * 파일 카테고리 및 확장자 상수
 */
export const FILE_CATEGORIES = [
  {
    id: "image",
    label: "Image",
    labelKo: "이미지",
    icon: FileImage,
    color: "bg-blue-400",
    extensions: [
      ".png",
      ".jpg",
      ".jpeg",
      ".webp",
      ".gif",
      ".svg",
      ".bmp",
      ".ico",
      ".tiff",
    ],
  },
  {
    id: "video",
    label: "Video",
    labelKo: "비디오",
    icon: Film,
    color: "bg-red-400",
    extensions: [".mp4", ".mov", ".avi", ".webm", ".mkv", ".wmv", ".flv", ".gifv"],
  },
  {
    id: "audio",
    label: "Audio",
    labelKo: "오디오",
    icon: Mic,
    color: "bg-purple-400",
    extensions: [".mp3", ".wav", ".ogg", ".m4a", ".flac", ".aac", ".wma"],
  },
  {
    id: "document",
    label: "Document",
    labelKo: "문서",
    icon: FileText,
    color: "bg-rose-400",
    extensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".ppt",
      ".pptx",
      ".xls",
      ".xlsx",
      ".txt",
      ".md",
      ".rtf",
    ],
  },
  {
    id: "data",
    label: "Data",
    labelKo: "데이터",
    icon: Database,
    color: "bg-emerald-400",
    extensions: [".json", ".csv", ".xml", ".sql", ".yaml", ".html", ".css", ".js"],
  },
  {
    id: "archive",
    label: "Archive",
    labelKo: "압축파일",
    icon: Archive,
    color: "bg-orange-400",
    extensions: [".zip", ".rar", ".7z", ".tar", ".gz", ".iso", ".dmg"],
  },
];

/**
 * 정상 파일 구조를 생성할 수 있는 확장자 목록
 * (이 목록에 없는 확장자는 바이너리 데이터 + 확장자 변경으로만 생성됨)
 */
export const SUPPORTED_EXTENSIONS = [
  // 이미지 (전체 지원)
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".ico", ".tiff",
  // 비디오 (일부 지원)
  ".mp4", ".mov", ".avi", ".webm", ".mkv", ".gifv",
  // 오디오 (일부 지원)
  ".wav", ".ogg", ".m4a", ".flac",
  // 문서 (전체 지원)
  ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx", ".txt", ".md", ".rtf",
  // 데이터 (전체 지원)
  ".json", ".csv", ".xml", ".sql", ".yaml", ".html", ".css", ".js",
  // 압축 (일부 지원)
  ".zip", ".tar", ".gz",
];

/**
 * 확장자가 정상 파일 생성을 지원하는지 확인
 * @param {string} ext - 확장자 (예: ".mp4")
 * @returns {boolean} 지원 여부
 */
export const isExtensionSupported = (ext) => {
  return SUPPORTED_EXTENSIONS.includes(ext.toLowerCase());
};

/**
 * 확장자별 MIME 타입 매핑
 */
export const EXTENSION_MIME_TYPES = {
  // Images
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".ico": "image/x-icon",
  ".tiff": "image/tiff",
  // Videos
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".avi": "video/x-msvideo",
  ".webm": "video/webm",
  ".mkv": "video/x-matroska",
  ".wmv": "video/x-ms-wmv",
  ".flv": "video/x-flv",
  ".gifv": "video/mp4",
  // Audio
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".ogg": "audio/ogg",
  ".m4a": "audio/mp4",
  ".flac": "audio/flac",
  ".aac": "audio/aac",
  ".wma": "audio/x-ms-wma",
  // Documents
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx":
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".xls": "application/vnd.ms-excel",
  ".xlsx":
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".rtf": "application/rtf",
  // Data
  ".json": "application/json",
  ".csv": "text/csv",
  ".xml": "application/xml",
  ".sql": "text/plain",
  ".yaml": "text/yaml",
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  // Archive
  ".zip": "application/zip",
  ".rar": "application/x-rar-compressed",
  ".7z": "application/x-7z-compressed",
  ".tar": "application/x-tar",
  ".gz": "application/gzip",
  ".iso": "application/x-iso9660-image",
  ".dmg": "application/x-apple-diskimage",
};

