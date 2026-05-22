import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [rootIndex, appAds] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("app-ads.txt", "utf8")
]);

assert.match(rootIndex, /name: "StarDiary"/);
assert.match(rootIndex, /detail: "StarDiary\/"/);
assert.match(rootIndex, /if \(userOS === "ios"\) return project\.ios \|\| project\.android \|\| project\.detail;/);
assert.match(rootIndex, /if \(userOS === "android"\) return project\.android \|\| project\.ios \|\| project\.detail;/);
assert.match(rootIndex, /return project\.ios \|\| project\.android \|\| project\.detail;/);
assert.match(rootIndex, /if \(project\.detail && url === project\.detail\) \{\s*window\.location\.href = url;/);
assert.match(appAds, /google\.com,\s*pub-/);

const requiredFiles = [
  "StarDiary/index.html",
  "StarDiary/privacy.html",
  "StarDiary/support.html",
  "StarDiary/download/Icon.png"
];

for (const file of requiredFiles) {
  await access(file);
}

const [index, privacy, support] = await Promise.all([
  readFile("StarDiary/index.html", "utf8"),
  readFile("StarDiary/privacy.html", "utf8"),
  readFile("StarDiary/support.html", "utf8")
]);

assert.match(index, /Star Diary/);
assert.match(index, /RevenueCat|Pro/i);
assert.match(index, /AdMob|ads/i);
assert.match(index, /privacy\.html/);
assert.match(index, /support\.html/);
assert.match(index, /com\.aly\.StarDiary/);

assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /Star Diary/);
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /AdMob/);
assert.match(privacy, /subscription/i);
assert.match(privacy, /children/i);

assert.match(support, /Support/);
assert.match(support, /Star Diary/);
assert.match(support, /mailto:/);

console.log("StarDiary public pages verification passed");
