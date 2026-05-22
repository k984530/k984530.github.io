import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const iosUrl = "https://apps.apple.com/app/sweet-sleep-solving-insomnia/id6751185069";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.SweetSleep";
const contactEmail = "hello@choiwon.dev";

const requiredFiles = [
  "SweetSleep/index.html",
  "SweetSleep/privacy.html",
  "SweetSleep/terms.html",
  "SweetSleep/support.html",
  "SweetSleep/download/Icon.png",
];

const missingFiles = [];
for (const file of requiredFiles) {
  await access(file).catch(() => missingFiles.push(file));
}
assert.deepEqual(missingFiles, []);

const [sitemap, index, privacy, terms, support] = await Promise.all([
  readFile("sitemap.xml", "utf8"),
  readFile("SweetSleep/index.html", "utf8"),
  readFile("SweetSleep/privacy.html", "utf8"),
  readFile("SweetSleep/terms.html", "utf8"),
  readFile("SweetSleep/support.html", "utf8"),
]);

assert.match(sitemap, /https:\/\/won-space\.com\/SweetSleep\/privacy\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/SweetSleep\/terms\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/SweetSleep\/support\.html/);

for (const html of [index, privacy, terms, support]) {
  assert.doesNotMatch(html, /href="#"/);
}

assert.match(index, /Sweet Sleep - Solving Insomnia/);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, /support\.html/);
assert.match(index, new RegExp(contactEmail));
assert.match(index, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(index, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(privacy, /Sweet Sleep Privacy Policy/);
assert.match(privacy, /sleep/i);
assert.match(privacy, /support requests/i);
assert.match(privacy, new RegExp(contactEmail));

assert.match(terms, /Sweet Sleep Terms of Service/);
assert.match(terms, /sleep/i);
assert.match(terms, /Privacy Policy/);
assert.match(terms, new RegExp(contactEmail));

assert.match(support, /Sweet Sleep Support/);
assert.match(support, /App Store/);
assert.match(support, /Google Play/);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, new RegExp(contactEmail));

console.log("SweetSleep public pages verification passed");
