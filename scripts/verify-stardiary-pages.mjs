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
assert.match(index, /One-time paid app/i);
assert.match(index, /v1\.0/);
assert.match(index, /JSON/);
assert.match(index, /100% local/i);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, /support\.html/);
assert.doesNotMatch(index, /Pro subscription/i);
assert.doesNotMatch(index, /Lifetime Pro/i);
assert.doesNotMatch(index, /RevenueCat/i);
assert.doesNotMatch(index, /entitlement check/i);

assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /개인정보처리방침/);
assert.match(privacy, /Star Diary \(별빛 일기\) 2\.0/);
assert.match(privacy, /2026-11-25/);
assert.match(privacy, /100% on your device/i);
assert.match(privacy, /100% 로컬 저장/);
assert.match(privacy, /Apple App Store/);
assert.match(privacy, /Google Play/);
assert.match(privacy, /never share, sell/i);
assert.match(privacy, /제3자 공유·판매 없음/);
assert.match(privacy, /No Server AI/i);
assert.match(privacy, /서버 AI 호출/);
assert.match(privacy, /children/i);
assert.match(privacy, /terms\.html/);
assert.match(privacy, /support\.html/);
assert.match(privacy, /mailto:hello@choiwon\.dev/);
assert.doesNotMatch(privacy, /AdMob/i);
assert.doesNotMatch(privacy, /RevenueCat/i);
assert.doesNotMatch(privacy, /Pro subscription/i);
assert.doesNotMatch(privacy, /Pro 구독/);
assert.doesNotMatch(privacy, /auto-renewable/i);
assert.doesNotMatch(privacy, /자동 갱신/);
assert.doesNotMatch(privacy, /receipt validation/i);
assert.doesNotMatch(privacy, /영수증 검증/);
assert.doesNotMatch(privacy, /in-app purchase/i);
assert.doesNotMatch(privacy, /인앱결제/);

assert.match(terms, /Terms of Service/);
assert.match(terms, /이용약관/);
assert.match(terms, /Star Diary \(별빛 일기\) 2\.0/);
assert.match(terms, /2026-11-25/);
assert.match(terms, /Apple App Store/);
assert.match(terms, /Google Play/);
assert.match(terms, /one-time paid app/i);
assert.match(terms, /단일 유료 구매 앱/);
assert.match(terms, /4종/);
assert.match(terms, /은하 아카이브/);
assert.match(terms, /별자리 연대기/);
assert.match(terms, /JSON/);
assert.match(terms, /100% On-Device Local Storage/i);
assert.match(terms, /100% 기기 로컬 저장/);
assert.match(terms, /medical/i);
assert.match(terms, /의료/);
assert.match(terms, /privacy\.html/);
assert.match(terms, /support\.html/);
assert.match(terms, /mailto:hello@choiwon\.dev/);
assert.doesNotMatch(terms, /RevenueCat/i);
assert.doesNotMatch(terms, /auto-renewable/i);
assert.doesNotMatch(terms, /자동 갱신/);
assert.doesNotMatch(terms, /24 hours/i);
assert.doesNotMatch(terms, /24시간/);
assert.doesNotMatch(terms, /Pro subscription/i);
assert.doesNotMatch(terms, /Pro 구독/);
assert.doesNotMatch(terms, /lifetime Pro/i);
assert.doesNotMatch(terms, /영구 Pro/);
assert.doesNotMatch(terms, /Restore Purchases/i);
assert.doesNotMatch(terms, /구매 복원/);

assert.match(support, /Support/);
assert.match(support, /Star Diary/);
assert.match(support, /App Store/);
assert.match(support, /id6756995556/);
assert.match(support, /one-time paid app/i);
assert.match(support, /v1\.0/);
assert.match(support, /JSON/);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, /mailto:hello@choiwon\.dev/);
assert.doesNotMatch(support, /Pro subscription/i);
assert.doesNotMatch(support, /Pro 구독/);
assert.doesNotMatch(support, /lifetime Pro/i);
assert.doesNotMatch(support, /Restore Purchases/i);
assert.doesNotMatch(support, /RevenueCat/i);

console.log("StarDiary public pages verification passed");
