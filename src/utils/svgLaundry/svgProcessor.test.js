import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeSVG, processSVG } from "./svgProcessor.js";

test("sanitizeSVG: 비어있는 입력은 빈 문자열 반환", () => {
  assert.equal(sanitizeSVG(""), "");
});

test("sanitizeSVG: DOM 파서가 없는 환경에서는 안전하게 빈 문자열 반환", () => {
  assert.equal(sanitizeSVG("<svg><script>alert(1)</script></svg>"), "");
});

test("processSVG: 비어있는 입력은 빈 문자열 반환", () => {
  const result = processSVG("", {
    minify: true,
    currentColor: true,
    jsx: true,
  });
  assert.equal(result, "");
});

test("processSVG: DOM 파서가 없는 환경에서는 안전하게 빈 문자열 반환", () => {
  const result = processSVG("<svg width='24'></svg>", {
    minify: true,
    currentColor: true,
    jsx: true,
  });
  assert.equal(result, "");
});
