import { readFile, writeFile } from "node:fs/promises";
import { render } from "../.prerender/entry-server.js";

const output = new URL("../dist/index.html", import.meta.url);
const template = await readFile(output, "utf8");
if (!template.includes("<!--app-html-->"))
  throw new Error("Prerender marker missing");
const html = template.replace("<!--app-html-->", await render());
for (const content of [
  "Jan Sultan",
  "TOP Church",
  "WebCTF-Auto",
  "mailto:jansultan670@gmail.com",
]) {
  if (!html.includes(content))
    throw new Error(`Prerender missing content: ${content}`);
}
if (/\u2014/.test(html))
  throw new Error("Remove em dashes from published copy");
await writeFile(output, html);
console.log("Prerendered portfolio content into dist/index.html");
