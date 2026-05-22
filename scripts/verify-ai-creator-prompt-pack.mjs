import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

await access("AI-Creator-Prompt-Pack/index.html");

const [rootIndex, page, sitemap, kovaIndex, styles, figurine, headshot] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("AI-Creator-Prompt-Pack/index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("Kova/index.html", "utf8"),
  readFile("Kova/ai-photo-editor-styles/index.html", "utf8"),
  readFile("Kova/ai-figurine-generator/index.html", "utf8"),
  readFile("Kova/ai-profile-headshot-generator/index.html", "utf8"),
]);

assert.match(page, /AI Creator Prompt Pack/);
assert.match(page, /29,000 KRW/);
assert.match(page, /60 prompts/);
assert.match(page, /7 workflows/);
assert.match(page, /90 caption starters/);
assert.match(page, /mailto:alyduho984530@gmail\.com\?subject=AI%20Creator%20Prompt%20Pack/);
assert.match(page, /Creator action figure/);
assert.match(page, /App hero mockup/);
assert.match(page, /Korean launch visual/);
assert.match(page, /\.\.\/Kova\//);
assert.match(page, /\.\.\/Kova\/ai-figurine-generator\//);
assert.match(page, /\.\.\/Kova\/ai-profile-headshot-generator\//);

assert.match(sitemap, /https:\/\/won-space\.com\/AI-Creator-Prompt-Pack\//);
assert.match(rootIndex, /name: "AI Creator Prompt Pack"/);
assert.match(rootIndex, /detail: "AI-Creator-Prompt-Pack\/"/);
assert.match(rootIndex, /31 Projects/);
assert.match(kovaIndex, /\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(styles, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(figurine, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(headshot, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);

console.log("AI Creator Prompt Pack verification passed");
