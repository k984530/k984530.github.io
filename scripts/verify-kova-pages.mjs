import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const iosUrl = "https://apps.apple.com/us/app/kova-ai-photo-editor/id6766026914";
const androidUrl = "https://play.google.com/store/apps/details?id=com.aly.kova";
const contactEmail = "alyduho984530@gmail.com";

const requiredFiles = [
  "Kova/index.html",
  "Kova/download/index.html",
  "Kova/shared-result/index.html",
  "Kova/download-qr.svg",
  "Kova/quick-start/index.html",
  "Kova/free-ai-photo-editor/index.html",
  "Kova/app-launch-visuals/index.html",
  "Kova/ai-idea-visualizer/index.html",
  "Kova/studio-sprint/index.html",
  "Kova/pricing/index.html",
  "Kova/examples/index.html",
  "Kova/ai-photo-editor-styles/index.html",
  "Kova/ai-avatar-generator/index.html",
  "Kova/ai-anime-portrait-generator/index.html",
  "Kova/ai-dating-profile-picture-generator/index.html",
  "Kova/ai-pet-portrait-generator/index.html",
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
  "Kova/assets/profile_headshot.webp",
  "Kova/download/Icon.png",
];

for (const file of requiredFiles) {
  await access(file);
}

const [rootIndex, sitemap, index, download, sharedResult, quickStart, freeEditor, appLaunch, ideaVisualizer, studioSprint, pricing, examples, styles, avatar, anime, dating, pet, privacy, terms, support] = await Promise.all([
  readFile("index.html", "utf8"),
  readFile("sitemap.xml", "utf8"),
  readFile("Kova/index.html", "utf8"),
  readFile("Kova/download/index.html", "utf8"),
  readFile("Kova/shared-result/index.html", "utf8"),
  readFile("Kova/quick-start/index.html", "utf8"),
  readFile("Kova/free-ai-photo-editor/index.html", "utf8"),
  readFile("Kova/app-launch-visuals/index.html", "utf8"),
  readFile("Kova/ai-idea-visualizer/index.html", "utf8"),
  readFile("Kova/studio-sprint/index.html", "utf8"),
  readFile("Kova/pricing/index.html", "utf8"),
  readFile("Kova/examples/index.html", "utf8"),
  readFile("Kova/ai-photo-editor-styles/index.html", "utf8"),
  readFile("Kova/ai-avatar-generator/index.html", "utf8"),
  readFile("Kova/ai-anime-portrait-generator/index.html", "utf8"),
  readFile("Kova/ai-dating-profile-picture-generator/index.html", "utf8"),
  readFile("Kova/ai-pet-portrait-generator/index.html", "utf8"),
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
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/shared-result\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/quick-start\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/free-ai-photo-editor\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/app-launch-visuals\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-idea-visualizer\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/studio-sprint\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-avatar-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-anime-portrait-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-dating-profile-picture-generator\//);
assert.match(sitemap, /https:\/\/won-space\.com\/Kova\/ai-pet-portrait-generator\//);

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
assert.match(index, /shared-result\//);
assert.match(index, /quick-start\//);
assert.match(index, /free-ai-photo-editor\//);
assert.match(index, /app-launch-visuals\//);
assert.match(index, /ai-idea-visualizer\//);
assert.match(index, /studio-sprint\//);
assert.match(index, /ai-photo-editor-styles\//);
assert.match(index, /ai-avatar-generator\//);
assert.match(index, /ai-anime-portrait-generator\//);
assert.match(index, /ai-dating-profile-picture-generator\//);
assert.match(index, /ai-pet-portrait-generator\//);
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
assert.match(download, /\.\.\/quick-start\//);
assert.match(download, /\.\.\/free-ai-photo-editor\//);
assert.match(download, /privacy\.html/);
assert.match(download, /terms\.html/);
assert.match(download, /support\.html/);

assert.match(sharedResult, /<title>Made With Kova \| Shared AI Photo Result<\/title>/);
assert.match(sharedResult, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/shared-result\/">/);
assert.match(sharedResult, /Made With Kova/);
assert.match(sharedResult, /Someone made this style from one photo/i);
assert.match(sharedResult, /20 starter credits/i);
assert.match(sharedResult, /about 2 standard image generations/i);
assert.match(sharedResult, /10 credits per standard image generation/i);
assert.match(sharedResult, /Open Kova on your phone/i);
assert.match(sharedResult, /Compare pricing/i);
assert.match(sharedResult, /See examples/i);
assert.match(sharedResult, /application\/ld\+json/);
assert.match(sharedResult, /SoftwareApplication/);
assert.match(sharedResult, /FAQPage/);
assert.match(sharedResult, /assets\/figurine\.webp/);
assert.match(sharedResult, /assets\/anime\.webp/);
assert.match(sharedResult, /assets\/polaroid\.webp/);
assert.match(sharedResult, /download\/index\.html/);
assert.match(sharedResult, /pricing\//);
assert.match(sharedResult, /examples\//);
assert.match(sharedResult, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(sharedResult, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(quickStart, /<title>Kova Quick Start \| Create Your First AI Photo Edit<\/title>/);
assert.match(quickStart, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/quick-start\/">/);
assert.match(quickStart, /Create your first Kova edit/);
assert.match(quickStart, /20 starter credits/i);
assert.match(quickStart, /about 2 standard image generations/i);
assert.match(quickStart, /10 credits per standard image generation/i);
assert.match(quickStart, /Choose one clear photo/);
assert.match(quickStart, /Pick a ready-made style/);
assert.match(quickStart, /Generate the first result/);
assert.match(quickStart, /Save, share, or try one more/);
assert.match(quickStart, /application\/ld\+json/);
assert.match(quickStart, /HowTo/);
assert.match(quickStart, /assets\/figurine\.webp/);
assert.match(quickStart, /assets\/anime\.webp/);
assert.match(quickStart, /assets\/profile_headshot_male_after\.webp/);
assert.match(quickStart, /assets\/polaroid\.webp/);
assert.match(quickStart, /\.\.\/download\/index\.html/);
assert.match(quickStart, /\.\.\/examples\//);
assert.match(quickStart, /\.\.\/free-ai-photo-editor\//);
assert.match(quickStart, /\.\.\/pricing\//);
assert.match(quickStart, /\.\.\/ai-photo-editor-styles\//);
assert.match(quickStart, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(quickStart, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(freeEditor, /<title>Free AI Photo Editor \| Kova<\/title>/);
assert.match(freeEditor, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/free-ai-photo-editor\/">/);
assert.match(freeEditor, /Free AI Photo Editor/);
assert.match(freeEditor, /free to install/i);
assert.match(freeEditor, /20 starter credits/i);
assert.match(freeEditor, /about 2 standard image generations/i);
assert.match(freeEditor, /10 credits per standard image generation/i);
assert.match(freeEditor, /No prompt writing required/);
assert.match(freeEditor, /Try before choosing a plan/);
assert.match(freeEditor, /application\/ld\+json/);
assert.match(freeEditor, /SoftwareApplication/);
assert.match(freeEditor, /FAQPage/);
assert.match(freeEditor, /assets\/figurine\.webp/);
assert.match(freeEditor, /assets\/anime\.webp/);
assert.match(freeEditor, /assets\/profile_headshot_male_after\.webp/);
assert.match(freeEditor, /\.\.\/download\/index\.html/);
assert.match(freeEditor, /\.\.\/quick-start\//);
assert.match(freeEditor, /\.\.\/pricing\//);
assert.match(freeEditor, /\.\.\/examples\//);
assert.match(freeEditor, /\.\.\/ai-photo-editor-styles\//);
assert.match(freeEditor, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(freeEditor, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(appLaunch, /<title>AI App Launch Visuals \| Kova<\/title>/);
assert.match(appLaunch, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/app-launch-visuals\/">/);
assert.match(appLaunch, /AI App Launch Visuals/);
assert.match(appLaunch, /for app makers/i);
assert.match(appLaunch, /founder profile/i);
assert.match(appLaunch, /launch posts/i);
assert.match(appLaunch, /product-style visuals/i);
assert.match(appLaunch, /20 starter credits/i);
assert.match(appLaunch, /about 2 standard image generations/i);
assert.match(appLaunch, /10 credits per standard image generation/i);
assert.match(appLaunch, /application\/ld\+json/);
assert.match(appLaunch, /SoftwareApplication/);
assert.match(appLaunch, /FAQPage/);
assert.match(appLaunch, /assets\/profile_headshot\.webp/);
assert.match(appLaunch, /assets\/figurine\.webp/);
assert.match(appLaunch, /assets\/polaroid\.webp/);
assert.match(appLaunch, /assets\/anime\.webp/);
assert.match(appLaunch, /\.\.\/download\/index\.html/);
assert.match(appLaunch, /\.\.\/quick-start\//);
assert.match(appLaunch, /\.\.\/pricing\//);
assert.match(appLaunch, /\.\.\/examples\//);
assert.match(appLaunch, /\.\.\/ai-photo-editor-styles\//);
assert.match(appLaunch, /\.\.\/ai-idea-visualizer\//);
assert.match(appLaunch, /\.\.\/studio-sprint\//);
assert.match(appLaunch, /Kova Studio Sprint/);
assert.match(appLaunch, /\.\.\/\.\.\/AppHub\//);
assert.match(appLaunch, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(appLaunch, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(ideaVisualizer, /<title>AI Idea Visualizer \| Kova<\/title>/);
assert.match(ideaVisualizer, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-idea-visualizer\/">/);
assert.match(ideaVisualizer, /AI Idea Visualizer/);
assert.match(ideaVisualizer, /for visual thinkers/i);
assert.match(ideaVisualizer, /mind maps/i);
assert.match(ideaVisualizer, /idea boards/i);
assert.match(ideaVisualizer, /concept directions/i);
assert.match(ideaVisualizer, /MindMapAI/i);
assert.match(ideaVisualizer, /20 starter credits/i);
assert.match(ideaVisualizer, /about 2 standard image generations/i);
assert.match(ideaVisualizer, /10 credits per standard image generation/i);
assert.match(ideaVisualizer, /application\/ld\+json/);
assert.match(ideaVisualizer, /SoftwareApplication/);
assert.match(ideaVisualizer, /FAQPage/);
assert.match(ideaVisualizer, /assets\/polaroid\.webp/);
assert.match(ideaVisualizer, /assets\/profile_headshot\.webp/);
assert.match(ideaVisualizer, /assets\/anime\.webp/);
assert.match(ideaVisualizer, /assets\/figurine\.webp/);
assert.match(ideaVisualizer, /\.\.\/download\/index\.html/);
assert.match(ideaVisualizer, /\.\.\/quick-start\//);
assert.match(ideaVisualizer, /\.\.\/pricing\//);
assert.match(ideaVisualizer, /\.\.\/examples\//);
assert.match(ideaVisualizer, /\.\.\/ai-photo-editor-styles\//);
assert.match(ideaVisualizer, /\.\.\/studio-sprint\//);
assert.match(ideaVisualizer, /Kova Studio Sprint/);
assert.match(ideaVisualizer, /\.\.\/\.\.\/MindMapAI\//);
assert.match(ideaVisualizer, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(ideaVisualizer, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(studioSprint, /<title>Kova Studio Sprint \| AI Launch Visual Service<\/title>/);
assert.match(studioSprint, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/studio-sprint\/">/);
assert.match(studioSprint, /\.hero > div\s*\{[\s\S]*?min-width: 0;/);
assert.match(studioSprint, /Kova Studio Sprint/);
assert.match(studioSprint, /for app makers, creators, and small teams/i);
assert.match(studioSprint, /990,000 KRW/);
assert.match(studioSprint, /2,900,000 KRW/);
assert.match(studioSprint, /9,900,000 KRW\+/);
assert.match(studioSprint, /Launch visual sprint/);
assert.match(studioSprint, /Creator campaign system/);
assert.match(studioSprint, /Portfolio revenue system/);
assert.match(studioSprint, /Package deliverables/);
assert.match(studioSprint, /8 launch visuals/);
assert.match(studioSprint, /12 campaign visuals/);
assert.match(studioSprint, /24 funnel visuals/);
assert.match(studioSprint, /3 prompt recipes/);
assert.match(studioSprint, /8 prompt recipes/);
assert.match(studioSprint, /12 prompt recipes/);
assert.match(studioSprint, /Founder profile/);
assert.match(studioSprint, /App launch posts/);
assert.match(studioSprint, /Prompt system handoff/);
assert.match(studioSprint, /Typical delivery timeline/);
assert.match(studioSprint, /Scope confirmation before invoice/);
assert.match(studioSprint, /Payment due before production begins/);
assert.match(studioSprint, /First visual board in 3 business days/);
assert.match(studioSprint, /Final launch kit in 5 business days/);
assert.match(studioSprint, /One revision pass included/);
assert.match(studioSprint, /Invoice-ready sprint request/);
assert.match(studioSprint, /How paid sprint starts/);
assert.match(studioSprint, /within 24 hours KST/i);
assert.match(studioSprint, /Request invoice/);
assert.match(studioSprint, /Request 990,000 KRW invoice/);
assert.match(studioSprint, /Request 2,900,000 KRW invoice/);
assert.match(studioSprint, /Request 9,900,000 KRW\+ invoice/);
assert.match(studioSprint, /id="launch-visual-sprint"/);
assert.match(studioSprint, /id="creator-campaign-system"/);
assert.match(studioSprint, /id="portfolio-revenue-system"/);
assert.match(studioSprint, /Referral source/);
assert.match(studioSprint, /sourceLabels/);
assert.match(studioSprint, /AppHub landing page/);
assert.match(studioSprint, /MindMapAI landing page/);
assert.match(studioSprint, /Sprint brief builder/);
assert.match(studioSprint, /id="sprintBriefBuilder"/);
assert.match(studioSprint, /name="brief_package"/);
assert.match(studioSprint, /name="brief_referral_source"/);
assert.match(studioSprint, /name="brief_buyer"/);
assert.match(studioSprint, /name="brief_payment_preference"/);
assert.match(studioSprint, /name="brief_receipt_needed"/);
assert.match(studioSprint, /name="brief_launch_date"/);
assert.match(studioSprint, /name="brief_product_link"/);
assert.match(studioSprint, /name="brief_materials_link"/);
assert.match(studioSprint, /name="brief_commercial_scope"/);
assert.match(studioSprint, /name="brief_decision_timeline"/);
assert.match(studioSprint, /name="brief_notes"/);
assert.match(studioSprint, /id="briefInvoiceLink"/);
assert.match(studioSprint, /function updateBriefInvoiceLink/);
assert.match(studioSprint, /Create invoice email/);
assert.match(studioSprint, /Commercial usage scope/);
assert.match(studioSprint, /Payment preference/);
assert.match(studioSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20inquiry/);
assert.match(studioSprint, /Budget%3A%20990%2C000%20%2F%202%2C900%2C000%20%2F%209%2C900%2C000%2B%20KRW/);
assert.match(studioSprint, /Target%20launch%20date/);
assert.match(studioSprint, /Product%20or%20creator%20link/);
assert.match(studioSprint, /mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request/);
const sprintInvoiceMailLink = studioSprint.match(/mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request&body=([^"]+)/);
assert.ok(sprintInvoiceMailLink);
const decodedSprintInvoiceEmail = decodeURIComponent(sprintInvoiceMailLink[1]);
assert.match(decodedSprintInvoiceEmail, /Selected package:/);
assert.match(decodedSprintInvoiceEmail, /Buyer or company:/);
assert.match(decodedSprintInvoiceEmail, /Payment preference:/);
assert.match(decodedSprintInvoiceEmail, /Receipt or tax invoice needed:/);
assert.match(decodedSprintInvoiceEmail, /Commercial usage scope:/);
assert.match(decodedSprintInvoiceEmail, /Decision timeline:/);
const packageInvoiceMailLinks = [...studioSprint.matchAll(/mailto:alyduho984530@gmail\.com\?subject=Kova%20Studio%20Sprint%20invoice%20request&body=([^"]+)/g)]
    .map((match) => decodeURIComponent(match[1]));
for (const selectedPackage of [
    "Selected package: Launch visual sprint - 990,000 KRW",
    "Selected package: Creator campaign system - 2,900,000 KRW",
    "Selected package: Portfolio revenue system - 9,900,000 KRW+",
]) {
    assert.ok(
        packageInvoiceMailLinks.some((body) => body.includes(selectedPackage)),
        `Missing package-specific invoice link for ${selectedPackage}`,
    );
}
assert.match(studioSprint, /application\/ld\+json/);
assert.match(studioSprint, /OfferCatalog/);
assert.match(studioSprint, /Service/);
assert.match(studioSprint, /assets\/profile_headshot\.webp/);
assert.match(studioSprint, /assets\/figurine\.webp/);
assert.match(studioSprint, /assets\/polaroid\.webp/);
assert.match(studioSprint, /\.\.\/app-launch-visuals\//);
assert.match(studioSprint, /\.\.\/ai-idea-visualizer\//);
assert.match(studioSprint, /\.\.\/download\/index\.html/);
assert.match(studioSprint, /\.\.\/\.\.\/AI-Creator-Prompt-Pack\//);
assert.match(studioSprint, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(studioSprint, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

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
assert.match(pricing, /\.\.\/quick-start\//);
assert.match(pricing, /\.\.\/free-ai-photo-editor\//);
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
assert.match(examples, /\.\.\/quick-start\//);
assert.match(examples, /\.\.\/free-ai-photo-editor\//);
assert.match(examples, /\.\.\/pricing\//);
assert.match(examples, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(examples, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(styles, /AI Photo Editor Styles/);
assert.match(styles, /Collectible Figurine/);
assert.match(styles, /Anime Portrait/);
assert.match(styles, /RevenueCat/);
assert.match(styles, /\.\.\/download\/index\.html/);
assert.match(styles, /\.\.\/pricing\//);
assert.match(styles, /\.\.\/free-ai-photo-editor\//);
assert.match(styles, /\.\.\/app-launch-visuals\//);
assert.match(styles, /\.\.\/ai-idea-visualizer\//);
assert.match(styles, /\.\.\/ai-avatar-generator\//);
assert.match(styles, /\.\.\/ai-anime-portrait-generator\//);
assert.match(styles, /\.\.\/privacy\.html/);
assert.match(styles, /\.\.\/terms\.html/);
assert.match(styles, /\.\.\/support\.html/);

assert.match(avatar, /<title>AI Avatar Generator \| Kova<\/title>/);
assert.match(avatar, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-avatar-generator\/">/);
assert.match(avatar, /AI Avatar Generator/);
assert.match(avatar, /avatar/i);
assert.match(avatar, /profile picture/i);
assert.match(avatar, /20 starter credits/i);
assert.match(avatar, /about 2 standard image generations/i);
assert.match(avatar, /10 credits per standard image generation/i);
assert.match(avatar, /assets\/anime\.webp/);
assert.match(avatar, /assets\/profile_headshot_male_after\.webp/);
assert.match(avatar, /assets\/figurine\.webp/);
assert.match(avatar, /application\/ld\+json/);
assert.match(avatar, /SoftwareApplication/);
assert.match(avatar, /\.\.\/download\/index\.html/);
assert.match(avatar, /\.\.\/pricing\//);
assert.match(avatar, /\.\.\/examples\//);
assert.match(avatar, /\.\.\/ai-photo-editor-styles\//);
assert.match(avatar, /\.\.\/ai-anime-portrait-generator\//);
assert.match(avatar, /\.\.\/ai-profile-headshot-generator\//);
assert.match(avatar, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(avatar, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

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

assert.match(dating, /<title>AI Dating Profile Picture Generator \| Kova<\/title>/);
assert.match(dating, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-dating-profile-picture-generator\/">/);
assert.match(dating, /AI Dating Profile Picture Generator/);
assert.match(dating, /dating profile/i);
assert.match(dating, /profile picture/i);
assert.match(dating, /20 starter credits/i);
assert.match(dating, /about 2 standard image generations/i);
assert.match(dating, /10 credits per standard image generation/i);
assert.match(dating, /assets\/profile_headshot_male_before\.webp/);
assert.match(dating, /assets\/profile_headshot_male_after\.webp/);
assert.match(dating, /assets\/profile_headshot_female_before\.webp/);
assert.match(dating, /assets\/profile_headshot_female_after\.webp/);
assert.match(dating, /application\/ld\+json/);
assert.match(dating, /SoftwareApplication/);
assert.match(dating, /\.\.\/download\/index\.html/);
assert.match(dating, /\.\.\/pricing\//);
assert.match(dating, /\.\.\/examples\//);
assert.match(dating, /\.\.\/ai-profile-headshot-generator\//);
assert.match(dating, /\.\.\/ai-photo-editor-styles\//);
assert.match(dating, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(dating, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

assert.match(pet, /<title>AI Pet Portrait Generator \| Kova<\/title>/);
assert.match(pet, /<link rel="canonical" href="https:\/\/won-space\.com\/Kova\/ai-pet-portrait-generator\/">/);
assert.match(pet, /AI Pet Portrait Generator/);
assert.match(pet, /pet portrait/i);
assert.match(pet, /cat photo/i);
assert.match(pet, /dog photo/i);
assert.match(pet, /20 starter credits/i);
assert.match(pet, /about 2 standard image generations/i);
assert.match(pet, /10 credits per standard image generation/i);
assert.match(pet, /application\/ld\+json/);
assert.match(pet, /SoftwareApplication/);
assert.match(pet, /download\/Icon\.png/);
assert.match(pet, /\.\.\/download\/index\.html/);
assert.match(pet, /\.\.\/pricing\//);
assert.match(pet, /\.\.\/examples\//);
assert.match(pet, /\.\.\/ai-photo-editor-styles\//);
assert.match(pet, new RegExp(iosUrl.replaceAll(".", "\\.")));
assert.match(pet, new RegExp(androidUrl.replaceAll(".", "\\.").replace("?", "\\?")));

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
