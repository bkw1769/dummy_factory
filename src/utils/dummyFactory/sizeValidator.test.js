import test from "node:test";
import assert from "node:assert/strict";
import { validateSize } from "./sizeValidator.js";

test("validateSize: 숫자가 아니면 0으로 보정한다", () => {
  assert.equal(validateSize("abc"), 0);
});

test("validateSize: 음수 입력은 0으로 보정한다", () => {
  assert.equal(validateSize(-1), 0);
});

test("validateSize: 최대값(1000MB)을 넘으면 1000으로 보정한다", () => {
  assert.equal(validateSize(5000), 1000);
});

test("validateSize: 정상 범위 값은 그대로 유지한다", () => {
  assert.equal(validateSize(256), 256);
});
