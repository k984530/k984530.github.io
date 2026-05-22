import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const iosUrl = "https://apps.apple.com/us/app/kova-ai-photo-editor/id6766026914";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.kova";
const contactEmail = "alyduho984530@gmail.com";

const requiredFiles = [
  "Kova/index.html",
  "Kova/download/index.html",
  "Kova/download-qr.svg",
  "Kova/pricing/index.html",
  "Kova/ai-photo-editor-styles/index.html",
  "Kova/ai-anime-portrait-generator/index.html",
  "Kova/privacy.html",
  "Kova/terms.html",
  "Kova/support.html",
  "Kova/assets/anime.webp",
  "Kova/assets/cyberpunk.webp",
  "Kova/assets/figurine.webp",
  "Kova/assets/polaroid.webp",
  "Kova/download/Icon.png",
];

for (const file of requiredFiles) {
  await access(file);
}

const [rootIndex, sitemap, index, download, pricing, styles, anime, privacy, terms, support] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("Kova/index.html", "utf8"),
  readFile("Kova/download/index.html", "utf8"),
  readFile("Kova/pricing/index.html", "utf8"),
  readFile("Kova/ai-photo-editor-styles/index.html", "utf8"),
  readFile("Kova/ai-anime-portrait-generator/index.html", "utf8"),
  readFile("Kova/privacy.html", "utf8"),
  readFile("Kova/terms.html", "utf8"),
  readFile("Kova/support.html", "utf8"),
]);

assert.match(rootIndex, /name: "Kova"/);
assert.match(rootIndex, /detail: "Kova\/"/);
assert.match(rootIndex, /https:\/\/apps\.apple\.com\/us\/app\/kova-ai-photo-editor\/id6766026914/);
assert.match(rootIndex, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.kova/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/privacy\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/terms\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/support\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-anime-portrait-generator\//);

assert.match(index, /<title>Kova: AI Photo Editor<\/title>/);
assert.match(index, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/">/);
assert.match(index, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(index, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
assert.match(index, /Kova\/download\/index\.html/);
assert.match(index, /download-qr\.svg/);
assert.match(index, /download\/Icon\.png/);
assert.match(index, /20 starter credits/i);
assert.match(index, /about 2 standard image generations/i);
assert.match(index, /application\/ld\+json/);
assert.match(index, /SoftwareApplication/);
assert.match(index, /assets\/figurine\.webp/);
assert.match(index, /assets\/anime\.webp/);
assert.match(index, /assets\/polaroid\.webp/);
assert.match(index, /assets\/cyberpunk\.webp/);
assert.match(index, /Credits and membership ready/);
assert.match(index, /RevenueCat credits/);
assert.match(index, /private galleries/i);
assert.match(index, /privacy\.html/);
assert.match(index, /terms\.html/);
assert.match(index, /support\.html/);
assert.match(index, /pricing\//);
assert.match(index, /ai-photo-editor-styles\//);
assert.match(index, /ai-anime-portrait-generator\//);
assert.match(index, new RegExp(contactEmail));

assert.match(download, /const iosUrl = "https:\/\/apps\.apple\.com\/us\/app\/kova-ai-photo-editor\/id6766026914"/);
assert.match(download, /const androidUrl = "https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.kova"/);
assert.match(download, /iPhone\|iPad\|iPod/);
assert.match(download, /Android/i);
assert.match(download, /App Store/);
assert.match(download, /Google Play/);
assert.match(download, /privacy\.html/);
assert.match(download, /terms\.html/);
assert.match(download, /support\.html/);

assert.match(pricing, /Kova Pricing, Credits, and Memberships/);
assert.match(pricing, /Credit Packs/);
assert.match(pricing, /Monthly Plans/);
assert.match(pricing, /\.\.\/download\/index\.html/);
assert.match(pricing, /\.\.\/ai-photo-editor-styles\//);
assert.match(pricing, /\.\.\/privacy\.html/);
assert.match(pricing, /\.\.\/terms\.html/);
assert.match(pricing, /\.\.\/support\.html/);

assert.match(styles, /AI Photo Editor Styles/);
assert.match(styles, /Collectible Figurine/);
assert.match(styles, /Anime Portrait/);
assert.match(styles, /RevenueCat/);
assert.match(styles, /\.\.\/download\/index\.html/);
assert.match(styles, /\.\.\/pricing\//);
assert.match(styles, /\.\.\/ai-anime-portrait-generator\//);
assert.match(styles, /\.\.\/privacy\.html/);
assert.match(styles, /\.\.\/terms\.html/);
assert.match(styles, /\.\.\/support\.html/);

assert.match(anime, /<title>AI Anime Portrait Generator \| Kova<\/title>/);
assert.match(anime, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-anime-portrait-generator\/">/);
assert.match(anime, /AI Anime Portrait Generator/);
assert.match(anime, /Anime Portrait/);
assert.match(anime, /assets\/anime\.webp/);
assert.match(anime, /application\/ld\+json/);
assert.match(anime, /SoftwareApplication/);
assert.match(anime, /\.\.\/download\/index\.html/);
assert.match(anime, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(anime, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));
assert.match(anime, /\.\.\/pricing\//);
assert.match(anime, /\.\.\/ai-photo-editor-styles\//);
assert.match(anime, /\.\.\/ai-figurine-generator\//);
assert.match(anime, /\.\.\/ai-profile-headshot-generator\//);

assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /Kova/);
assert.match(privacy, /Firebase/);
assert.match(privacy, /RevenueCat/);
assert.match(privacy, /Cloudflare R2/);
assert.match(privacy, /public community/i);
assert.match(privacy, /delete/i);
assert.match(privacy, new RegExp(contactEmail));

assert.match(terms, /Terms of Service/);
assert.match(terms, /Credits, Purchases, and Subscriptions/);
assert.match(terms, /AI Generated Output/);
assert.match(terms, /Acceptable Use/);
assert.match(terms, /Privacy Policy/);
assert.match(terms, new RegExp(contactEmail));

assert.match(support, /Kova Support/);
assert.match(support, /restore purchases/i);
assert.match(support, /credits/i);
assert.match(support, /account deletion/i);
assert.match(support, /privacy\.html/);
assert.match(support, /terms\.html/);
assert.match(support, new RegExp(contactEmail));

console.log("Kova public pages verification passed");
