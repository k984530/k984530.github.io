import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const iosUrl = "https://apps.apple.com/app/chat-vibe-check-chat-analyzer/id6742811212";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.loveExpert";
const contactEmail = "alyduho984530@gmail.com";

const requiredFiles = [
  "ChatVibe/index.html",
  "ChatVibe/download/Icon.png",
  "appstore.png",
  "googleplay.png",
];

for (const file of requiredFiles) {
  await access(file);
}

const [rootIndex, sitemap, page] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("ChatVibe/index.html", "utf8"),
]);

assert.match(rootIndex, /name: "LoveExpert"/);
assert.match(rootIndex, /detail: "ChatVibe\/"/);
assert.match(rootIndex, /apps\.apple\.com\/app\/chat-vibe-check-chat-analyzer\/id6742811212/);
assert.match(rootIndex, /play\.google\.com\/store\/apps\/details\?id=com\.aly\.loveExpert/);

assert.match(sitemap, /https:\/\/won-space\.com\/ChatVibe\//);

assert.match(page, /<title>Chat Vibe - Analyze Chat Chemistry<\/title>/);
assert.match(page, /<link rel="canonical" href="https:\/\/won-space\.com\/ChatVibe\/">/);
assert.match(page, /property="og:url" content="https:\/\/won-space\.com\/ChatVibe\/"/);
assert.match(page, /download\/Icon\.png/);
assert.match(page, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(page, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
assert.match(page, /Download on the App Store/);
assert.match(page, /Get it on Google Play/);
assert.match(page, /Open Kova/);
assert.match(page, /\.\.\/Kova\//);
assert.match(page, /Vibe Analysis/);
assert.match(page, /Compatibility Score/);
assert.match(page, /Private & Secure/);
assert.match(page, new RegExp(contactEmail));
assert.doesNotMatch(page, /href="https:\/\/[^"]+" class="download-btn" target="_blank"(?! rel="noopener")/);

console.log("ChatVibe public page verification passed");
