import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const iosUrl = "https://apps.apple.com/us/app/mobile-code-remote-desktop/id6747654271";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.MobileCode";
const contactEmail = "hello@choiwon.dev";

const requiredFiles = [
  "MobileCode/index.html",
  "MobileCode/download.html",
  "MobileCode/privacy.html",
  "MobileCode/terms.html",
  "MobileCode/support.html",
  "MobileCode/download/Icon.png",
  "MobileCode/download/MobileCode.zip",
];

const missingFiles = [];
for (const file of requiredFiles) {
  await access(file).catch(() => missingFiles.push(file));
}

assert.deepEqual(missingFiles, []);

const [sitemap, index, download, privacy, terms, support] = await Promise.all([
  readFile("sitemap.xml", "utf8"),
  readFile("MobileCode/index.html", "utf8"),
  readFile("MobileCode/download.html", "utf8"),
  readFile("MobileCode/privacy.html", "utf8"),
  readFile("MobileCode/terms.html", "utf8"),
  readFile("MobileCode/support.html", "utf8"),
]);

assert.match(sitemap, /https:\/\/won-space\.com\/MobileCode\/download\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/MobileCode\/privacy\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/MobileCode\/terms\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/MobileCode\/support\.html/);

for (const html of [index, download, privacy, terms, support]) {
  assert.doesNotMatch(html, /href="#"/);
  assert.doesNotMatch(html, /yourusername|id123456789|com\.won\.mobilecode/);
}

assert.match(index, /Mobile Code - Remote Desktop Control/);
assert.match(index, /support\.html/);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, new RegExp(contactEmail));
assert.match(index, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(index, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(download, /<link rel="canonical" href="https:\/\/won-space\.com\/MobileCode\/download\.html">/);
assert.match(download, /download\/MobileCode\.zip/);
assert.match(download, /privacy\.html/);
assert.match(download, /terms\.html/);
assert.match(download, /support\.html/);
assert.match(download, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(download, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(privacy, /Mobile Code Privacy Policy/);
assert.match(privacy, /remote desktop/i);
assert.match(privacy, /support requests/i);
assert.match(privacy, new RegExp(contactEmail));

assert.match(terms, /Mobile Code Terms of Service/);
assert.match(terms, /authorized devices/i);
assert.match(terms, /remote access/i);
assert.match(terms, /Privacy Policy/);
assert.match(terms, new RegExp(contactEmail));

assert.match(support, /Mobile Code Support/);
assert.match(support, /Desktop Server/);
assert.match(support, /Mobile App/);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, new RegExp(contactEmail));

console.log("MobileCode public pages verification passed");
