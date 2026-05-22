import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const ignoredDirectories = new Set([
  ".git",
  "assets",
  "canvaskit",
  "icons",
  "scripts",
]);

const entries = await readdir(".", { withFileTypes: true });
const topLevelPageDirs = [];

for (const entry of entries) {
  if (!entry.isDirectory() || ignoredDirectories.has(entry.name)) {
    continue;
  }

  try {
    await readFile(`${entry.name}/index.html`, "utf8");
    topLevelPageDirs.push(entry.name);
  } catch {
    // Not a public page directory.
  }
}

topLevelPageDirs.sort((a, b) => a.localeCompare(b));

const sitemap = await readFile("sitemap.xml", "utf8");
const missing = topLevelPageDirs
  .map((dir) => `https://won-space.com/${dir}/`)
  .filter((url) => !sitemap.includes(`<loc>${url}</loc>`));

assert.deepEqual(missing, []);

console.log(`Sitemap verification passed for ${topLevelPageDirs.length} top-level pages`);
