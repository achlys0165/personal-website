import assert from "node:assert/strict";
import { test } from "node:test";
import {
  evidenceConnections,
  evidenceNodes,
  relatedEvidence,
} from "../src/components/evidence/constellationData";

test("constellation contains the eight documented subjects with valid section links", () => {
  assert.deepEqual(
    new Set(evidenceNodes.map((node) => node.id)),
    new Set([
      "hymn",
      "vue",
      "jsp",
      "shared",
      "python",
      "webctf-auto",
      "ctf",
      "studyhub",
    ]),
  );
  for (const node of evidenceNodes) {
    assert.ok(node.x > 0 && node.x < 100 && node.y > 0 && node.y < 100);
    assert.match(
      node.href,
      /^#(hymn|skills|jsp|webctf-auto|experience|studyhub)$/,
    );
    assert.ok(node.description.length > 0);
  }
  assert.ok(new Set(evidenceNodes.map((node) => node.z)).size > 4);
});

test("connections reflect documented tools without implying the CTF tool won the event", () => {
  assert.deepEqual([...relatedEvidence("hymn")].sort(), ["hymn", "vue"]);
  assert.deepEqual([...relatedEvidence("shared")].sort(), [
    "jsp",
    "shared",
    "studyhub",
  ]);
  assert.deepEqual([...relatedEvidence("ctf")], ["ctf"]);
  assert.equal(evidenceConnections.length, 4);
  assert.equal(relatedEvidence(null).size, 0);
  assert.equal(
    evidenceNodes.find((node) => node.id === "ctf")?.relation,
    "Won at JISSA × Resecurity",
  );
  assert.equal(
    evidenceNodes.find((node) => node.id === "hymn")?.relation,
    "Built for TOP Church",
  );
});
