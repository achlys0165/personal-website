import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { test } from "node:test";

test("artwork manifest matches every delivered master and responsive image", async () => {
  const manifest = JSON.parse(
    await readFile(
      new URL("../public/art/manifest.json", import.meta.url),
      "utf8",
    ),
  );
  assert.equal(manifest.assets.length, 7);
  const names = new Set<string>();
  for (const asset of manifest.assets) {
    assert.ok(!names.has(asset.name));
    names.add(asset.name);
    assert.equal(asset.status, "final");
    assert.equal(asset.placeholder, false);
    const master = new URL("../" + asset.master.filename, import.meta.url);
    assert.equal((await stat(master)).size, asset.master.bytes);
    assert.deepEqual(
      (await readFile(master)).subarray(0, 8),
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    );
    assert.equal(asset.variants.length, 3);
    let lastWidth = 0;
    for (const variant of asset.variants) {
      assert.ok(variant.filename.startsWith("/art/"));
      assert.ok(variant.width > lastWidth);
      lastWidth = variant.width;
      assert.equal(variant.height, variant.width);
      const path = new URL("../public" + variant.filename, import.meta.url);
      const data = await readFile(path);
      assert.equal(data.length, variant.bytes);
      assert.equal(data.toString("ascii", 0, 4), "RIFF");
      assert.equal(data.toString("ascii", 8, 12), "WEBP");
      assert.equal(variant.transparent, true);
    }
  }
  const social = manifest.socialCard;
  const image = await readFile(
    new URL("../public" + social.filename, import.meta.url),
  );
  assert.equal(image.length, social.bytes);
  assert.equal(image.readUInt32BE(16), social.width);
  assert.equal(image.readUInt32BE(20), social.height);
  assert.equal(social.status, "final");
});
