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
  "Kova/examples/index.html",
  "Kova/ai-photo-editor-styles/index.html",
  "Kova/ai-anime-portrait-generator/index.html",
  "Kova/privacy.html",
  "Kova/terms.html",
  "Kova/support.html",
  "Kova/assets/anime.webp",
  "Kova/assets/cyberpunk.webp",
  "Kova/assets/figurine.webp",
  "Kova/assets/figurine_male_before.webp",
  "Kova/assets/figurine_male_after.webp",
  "Kova/assets/figurine_female_before.webp",
  "Kova/assets/figurine_female_after.webp",
  "Kova/assets/profile_headshot_male_before.webp",
  "Kova/assets/profile_headshot_male_after.webp",
  "Kova/assets/polaroid.webp",
  "Kova/download/Icon.png",
];

for (const file of requiredFiles) {
  await access(file);
}

const [rootIndex, sitemap, index, download, pricing, examples, styles, anime, privacy, terms, support] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("Kova/index.html", "utf8"),
  readFile("Kova/download/index.html", "utf8"),
  readFile("Kova/pricing/index.html", "utf8"),
  readFile("Kova/examples/index.html", "utf8"),
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
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/examples\//);
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
assert.match(index, /examples\//);
assert.match(index, /ai-photo-editor-styles\//);
assert.match(index, /ai-anime-portrait-generator\//);
assert.match(index, new RegExp(contactEmail));

assert.match(download, /const iosUrl = "https:\/\/apps\.apple\.com\/us\/app\/kova-ai-photo-editor\/id6766026914"/);
assert.match(download, /const androidUrl = "https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.kova"/);
assert.match(download, /iPhone\|iPad\|iPod/);
assert.match(download, /Android/i);
assert.match(download, /App Store/);
assert.match(download, /Google Play/);
assert.match(download, /20 starter credits/i);
assert.match(download, /about 2 standard image generations/i);
assert.match(download, /before choosing a membership or credit pack/i);
assert.match(download, /privacy\.html/);
assert.match(download, /terms\.html/);
assert.match(download, /support\.html/);

assert.match(pricing, /Kova Pricing, Credits, and Memberships/);
assert.match(pricing, /20 starter credits/i);
assert.match(pricing, /about 2 standard image generations/i);
assert.match(pricing, /10 credits per standard image generation/i);
assert.match(pricing, /Credit Packs/);
assert.match(pricing, /100 Credits/);
assert.match(pricing, /about 10 standard image generations/i);
assert.match(pricing, /\$2\.00/);
assert.match(pricing, /500 Credits/);
assert.match(pricing, /about 50 standard image generations/i);
assert.match(pricing, /\$10\.00/);
assert.match(pricing, /1000 Credits/);
assert.match(pricing, /about 100 standard image generations/i);
assert.match(pricing, /\$20\.00/);
assert.match(pricing, /Monthly Plans/);
assert.match(pricing, /500 monthly credits/);
assert.match(pricing, /about 50 standard image generations/i);
assert.match(pricing, /\$9\.99\/month/);
assert.match(pricing, /2000 monthly credits/);
assert.match(pricing, /about 200 standard image generations/i);
assert.match(pricing, /\$29\.99\/month/);
assert.match(pricing, /10000 monthly credits/);
assert.match(pricing, /about 1000 standard image generations/i);
assert.match(pricing, /\$99\.99\/month/);
assert.match(pricing, /Choose a credit pack/i);
assert.match(pricing, /Choose a monthly plan/i);
assert.match(pricing, /\.\.\/download\/index\.html/);
assert.match(pricing, /\.\.\/ai-photo-editor-styles\//);
assert.match(pricing, /\.\.\/examples\//);
assert.match(pricing, /\.\.\/privacy\.html/);
assert.match(pricing, /\.\.\/terms\.html/);
assert.match(pricing, /\.\.\/support\.html/);

assert.match(examples, /<title>Kova AI Photo Examples<\/title>/);
assert.match(examples, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/examples\/">/);
assert.match(examples, /Kova AI Photo Examples/);
assert.match(examples, /Before/);
assert.match(examples, /After/);
assert.match(examples, /Figurine package/);
assert.match(examples, /Profile headshot/);
assert.match(examples, /20 starter credits/i);
assert.match(examples, /about 2 standard image generations/i);
assert.match(examples, /assets\/figurine_male_before\.webp/);
assert.match(examples, /assets\/figurine_male_after\.webp/);
assert.match(examples, /assets\/figurine_female_before\.webp/);
assert.match(examples, /assets\/figurine_female_after\.webp/);
assert.match(examples, /assets\/profile_headshot_male_before\.webp/);
assert.match(examples, /assets\/profile_headshot_male_after\.webp/);
assert.match(examples, /\.\.\/download\/index\.html/);
assert.match(examples, /\.\.\/pricing\//);
assert.match(examples, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(examples, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

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
