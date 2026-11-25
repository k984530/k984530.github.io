import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const [rootIndex, appAds] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("app-ads.txt", "utf8")
]);

assert.match(rootIndex, /name: "StarDiary"/);
assert.match(rootIndex, /detail: "StarDiary\/"/);
assert.match(rootIndex, /name: "StarDiary"[^}]+ios: "https:\/\/apps\.apple\.com\/us\/app\/star-diary-stella-notes\/id6756995556"/);
assert.match(rootIndex, /if \(userOS === "ios"\) return project\.ios \|\| project\.detail \|\| project\.android;/);
assert.match(rootIndex, /if \(userOS === "android"\) return project\.android \|\| project\.detail \|\| project\.ios;/);
assert.match(rootIndex, /return project\.detail \|\| project\.ios \|\| project\.android;/);
assert.match(rootIndex, /if \(project\.detail && url === project\.detail\) \{\s*window\.location\.href = url;/);
assert.match(appAds, /google\.com,\s*pub-/);

const requiredFiles = [
  "StarDiary/index.html",
  "StarDiary/privacy.html",
  "StarDiary/terms.html",
  "StarDiary/support.html",
  "StarDiary/download/Icon.png"
];

for (const file of requiredFiles) {
  await access(file);
}

const [index, privacy, terms, support] = await Promise.all([
  readFile("StarDiary/index.html", "utf8"),
  readFile("StarDiary/privacy.html", "utf8"),
  readFile("StarDiary/terms.html", "utf8"),
  readFile("StarDiary/support.html", "utf8")
]);

assert.match(index, /Star Diary/);
assert.match(index, /Star Diary - Stella Notes/);
assert.match(index, /apps\.apple\.com\/us\/app\/star-diary-stella-notes\/id6756995556/);
assert.match(index, /Free core \+ optional Pro subscription/);
assert.match(index, /Lifetime Pro preserved/);
assert.match(index, /100% local/);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, /support\.html/);

assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /개인정보처리방침/);
assert.match(privacy, /Star Diary \(별빛 일기\) 2\.0/);
assert.match(privacy, /2026-11-25/);
assert.match(privacy, /100% on your device/i);
assert.match(privacy, /100% 로컬 저장/);
assert.match(privacy, /Apple App Store/);
assert.match(privacy, /Google Play/);
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /never sell/i);
assert.match(privacy, /AI/);
assert.match(privacy, /children/i);
assert.match(privacy, /terms\.html/);
assert.match(privacy, /support\.html/);
assert.doesNotMatch(privacy, /AdMob/i);

assert.match(terms, /Terms of Service/);
assert.match(terms, /이용약관/);
assert.match(terms, /Star Diary \(별빛 일기\) 2\.0/);
assert.match(terms, /2026-11-25/);
assert.match(terms, /Apple App Store/);
assert.match(terms, /Google Play/);
assert.match(terms, /24 hours/i);
assert.match(terms, /24시간/);
assert.match(terms, /v1\.0/);
assert.match(terms, /lifetime Pro/i);
assert.match(terms, /영구 Pro/);
assert.match(terms, /medical/i);
assert.match(terms, /의료/);
assert.match(terms, /privacy\.html/);
assert.match(terms, /support\.html/);
assert.match(terms, /mailto:hello@choiwon\.dev/);

assert.match(support, /Support/);
assert.match(support, /Star Diary/);
assert.match(support, /App Store/);
assert.match(support, /id6756995556/);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, /mailto:/);

console.log("StarDiary public pages verification passed");
