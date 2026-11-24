import assert from "node:assert/strict";
import { test } from "node:test";
import {
  acceptsFlag,
  constrainNode,
  portfolioFlag,
  heroFlag,
} from "../src/visualState";

test("board nodes stay inside the reachable board area after pointer or keyboard movement", () => {
  assert.deepEqual(constrainNode(-50, -20), { x: 20, y: 16 });
  assert.deepEqual(constrainNode(150, 120), { x: 80, y: 88 });
  assert.deepEqual(constrainNode(43, 62), { x: 43, y: 62 });
});

test("flag submission accepts the discoverable flag and rejects incorrect or injected answers", () => {
  assert.equal(acceptsFlag(portfolioFlag), true);
  assert.equal(acceptsFlag(heroFlag), true);
  assert.equal(acceptsFlag("  " + heroFlag + "\n"), true);
  assert.equal(acceptsFlag("<script>" + heroFlag + "</script>"), false);
  assert.equal(acceptsFlag(`  ${portfolioFlag}\n`), true);
  for (const input of [
    "",
    "FLAG{wrong}",
    portfolioFlag.toLowerCase(),
    `<script>${portfolioFlag}</script>`,
  ]) {
    assert.equal(acceptsFlag(input), false);
  }
});
