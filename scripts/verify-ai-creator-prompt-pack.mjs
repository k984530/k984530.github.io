import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

await access("AI-Creator-Prompt-Pack/index.html");
await access("AI-Creator-Prompt-Pack/download/ai-creator-prompt-pack-v1-sample.zip");

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
assert.match(page, /download\/ai-creator-prompt-pack-v1-sample\.zip/);
assert.match(page, /Free sample/);
assert.match(page, /Download sample ZIP/);
assert.match(page, /<meta property="og:image" content="https:\/\/won-space\.com\/icons\/Kova\.png">/);
assert.match(page, /<meta name="twitter:card" content="summary_large_image">/);
assert.match(page, /<meta name="twitter:image" content="https:\/\/won-space\.com\/icons\/Kova\.png">/);
assert.match(page, /src="\.\.\/icons\/Kova\.png" alt="Kova app icon"/);
assert.match(page, /How purchase works/);
assert.match(page, /Send a structured order email/);
assert.match(page, /Preferred payment method/);
assert.match(page, /Reply within 24 hours KST/);
assert.match(page, /Get the full ZIP after payment/);
assert.match(page, /Personal and commercial use/);
assert.match(page, /Do not resell the pack as-is/);
assert.match(page, /Delivery and license FAQ/);
assert.match(page, /Creator action figure/);
assert.match(page, /App hero mockup/);
assert.match(page, /Korean launch visual/);
assert.match(page, /Need a custom prompt bundle\?/);
assert.match(page, /10 custom prompts/);
assert.match(page, /59,000 KRW/);
assert.match(page, /30 custom prompts/);
assert.match(page, /149,000 KRW/);
assert.match(page, /Full brand prompt system/);
assert.match(page, /390,000 KRW\+/);
assert.match(page, /AI%20Creator%20custom%20prompt%20bundle%20inquiry/);
assert.match(page, /Niche%2Fbrand/);
assert.match(page, /Prompt%20quantity/);
assert.match(page, /Deadline/);
assert.match(page, /Kova Creator Bundle/);
assert.match(page, /Use Kova first/);
assert.match(page, /20 starter credits/);
assert.match(page, /about 2 standard image generations/);
assert.match(page, /\.\.\/Kova\//);
assert.match(page, /\.\.\/Kova\/download\//);
assert.match(page, /\.\.\/Kova\/pricing\//);
assert.match(page, /\.\.\/Kova\/studio-sprint\//);
assert.match(page, /Kova Studio Sprint/);
assert.match(page, /\.\.\/Kova\/ai-figurine-generator\//);
assert.match(page, /\.\.\/Kova\/ai-profile-headshot-generator\//);

const jsonLdBlocks = [...page.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));
const graphNodes = jsonLdBlocks.flatMap((block) => block["@graph"] ?? [block]);
const productNode = graphNodes.find((node) => node["@type"] === "Product");
assert.ok(productNode, "Product structured data should exist");
assert.equal(productNode.name, "AI Creator Prompt Pack");
assert.equal(productNode.sku, "ai-creator-prompt-pack-v1");
assert.equal(productNode.offers.price, "29000");
assert.equal(productNode.offers.priceCurrency, "KRW");
assert.equal(productNode.offers.availability, "https://schema.org/InStock");
assert.equal(productNode.offers.seller.name, "alyduho.develop");
assert.equal(productNode.isRelatedTo.name, "Kova: AI Photo Editor");

const faqNode = graphNodes.find((node) => node["@type"] === "FAQPage");
assert.ok(faqNode, "FAQPage structured data should exist");
assert.ok(faqNode.mainEntity.some((item) => /commercial use/.test(item.name)));
assert.ok(faqNode.mainEntity.some((item) => /resell/.test(item.name)));
assert.ok(faqNode.mainEntity.some((item) => /delivered/.test(item.name)));

const orderMailLink = page.match(/mailto:alyduho984530@gmail\.com\?subject=AI%20Creator%20Prompt%20Pack%20order&body=([^"]+)/);
assert.ok(orderMailLink);
const decodedOrderEmail = decodeURIComponent(orderMailLink[1]);
assert.match(decodedOrderEmail, /Preferred payment method:/);
assert.match(decodedOrderEmail, /Receipt email:/);
assert.match(decodedOrderEmail, /Country\/timezone:/);
assert.match(decodedOrderEmail, /Business receipt needed:/);

assert.match(sitemap, /https:\/\/won-space\.com\/AI-Creator-Prompt-Pack\//);
assert.match(rootIndex, /name: "AI Creator Prompt Pack"/);
assert.match(rootIndex, /detail: "AI-Creator-Prompt-Pack\/"/);
assert.match(rootIndex, /31 Projects/);
assert.match(kovaIndex, /\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(styles, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(figurine, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(headshot, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);

console.log("AI Creator Prompt Pack verification passed");
