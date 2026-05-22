import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const projectLandingDirs = {
  Kova: "Kova",
  AppHub: "AppHub",
  FriendAI: "FriendAI",
  MindMapAI: "MindMapAI",
  BlahChats: "BlahChat",
  CryptoAI: "CryptoAI",
  CryptoSkills: "CryptoSkills",
  ChartingSkill: "ChartingSkills",
  Wealtha: "Wealtha",
  HeartAI: "HeartAI",
  LoveExpert: "ChatVibe",
  FaceMatch: "faceMatch",
  RizzChat: "Rizzet",
  SecretMinds: "SecretMind",
  TheArtOfSeduction: "SeductionRules",
  CatsDiary: "CatsDiary",
  CatsThoughts: "CatsThoughts",
  DogsThoughts: "DogsThoughts",
  StarDiary: "StarDiary",
  SweetSleep: "SweetSleep",
  Selah: "Selah",
  Growvi: "Growvi",
  Anythoughts: "AnyThoughts",
  GeniePlanner: "GeniePlanner",
  VibePlanning: "VibePlanning",
  StatUP: "StatUP",
  MobileCode: "MobileCode",
  AnyPick: "Anypick",
  Lookey: "Lookey",
  GhostLens: "GhostLens",
  OneAI: "OneAI",
  MODEE: "MODEE",
};

const extraProjects = new Map([
  ["OneAI", {
    android: "https://play.google.com/store/apps/details?id=com.aly.OneAI",
    ios: "https://apps.apple.com/us/app/oneai-all-in-one-ai/id6751434220",
  }],
  ["MODEE", {
    android: "https://play.google.com/store/apps/details?id=com.aly.MODEE",
    ios: "https://apps.apple.com/app/modee-fashion-assistant/id6743519137",
  }],
]);

const kovaPromoDirs = new Set([
  "AppHub",
  "BlahChat",
  "CatsDiary",
  "CatsThoughts",
  "ChatVibe",
  "CryptoAI",
  "CryptoSkills",
  "DogsThoughts",
  "FriendAI",
  "GeniePlanner",
  "GhostLens",
  "HeartAI",
  "Lookey",
  "MindMapAI",
  "MobileCode",
  "Rizzet",
  "SeductionRules",
  "SecretMind",
  "VibePlanning",
  "faceMatch",
]);

const socialKovaIntentDirs = new Set([
  "BlahChat",
  "ChatVibe",
  "FriendAI",
  "HeartAI",
  "Rizzet",
  "SeductionRules",
  "SecretMind",
  "faceMatch",
]);

const petKovaIntentDirs = new Set([
  "CatsDiary",
  "CatsThoughts",
  "DogsThoughts",
]);

const professionalKovaIntentDirs = new Set([
  "CryptoAI",
  "CryptoSkills",
]);

const toolKovaIntentDirs = new Map([
  ["GeniePlanner", "genieplanner"],
  ["MobileCode", "mobilecode"],
  ["VibePlanning", "vibeplanning"],
]);

const rootIndex = await readFile("index.html", "utf8");
const projectMatches = [...rootIndex.matchAll(/\{\s*name: "([^"]+)"([\s\S]*?)\s*\}/g)];
const projects = new Map();

for (const [, name, body] of projectMatches) {
  const ios = body.match(/ios: "([^"]+)"/)?.[1];
  const android = body.match(/android: "([^"]+)"/)?.[1];
  const detail = body.match(/detail: "([^"]+)"/)?.[1];
  projects.set(name, { android, detail, ios });
}

const failures = [];

for (const [name, dir] of Object.entries(projectLandingDirs)) {
  const project = projects.get(name) ?? extraProjects.get(name);
  assert.ok(project, `Missing project metadata for ${name}`);

  await access(`${dir}/index.html`);
  const html = await readFile(`${dir}/index.html`, "utf8");
  const canonical = `https://won-space.com/${dir}/`;

  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    failures.push(`${dir}: missing canonical ${canonical}`);
  }
  if (!html.includes(`property="og:url" content="${canonical}"`)) {
    failures.push(`${dir}: missing og:url ${canonical}`);
  }
  if (project.ios && !html.includes(project.ios)) {
    failures.push(`${dir}: missing iOS store URL ${project.ios}`);
  }
  if (project.android && !html.includes(project.android)) {
    failures.push(`${dir}: missing Android store URL ${project.android}`);
  }
  if (/href="https:\/\/[^"]+"[^>]*target="_blank"(?![^>]*rel="noopener")/.test(html)) {
    failures.push(`${dir}: external target=_blank link without rel=noopener`);
  }
  if (/href="http:\/\/apps\.apple\.com/.test(html)) {
    failures.push(`${dir}: App Store link uses http instead of https`);
  }
  if (kovaPromoDirs.has(dir)) {
    if (!html.includes('class="kova-promo"')) {
      failures.push(`${dir}: missing Kova promo card`);
    }
    if (!html.includes("../Kova/")) {
      failures.push(`${dir}: missing Kova promo link`);
    }
    if (dir === "AppHub" && !html.includes("../Kova/app-launch-visuals/")) {
      failures.push(`${dir}: missing Kova app-launch visuals intent link`);
    }
    if (dir === "AppHub" && !html.includes("app launch visuals")) {
      failures.push(`${dir}: missing Kova app-launch visuals intent copy`);
    }
    if (dir === "AppHub" && !html.includes("../Kova/studio-sprint/?source=apphub&package=launch-visual-sprint#launch-visual-sprint")) {
      failures.push(`${dir}: missing source-aware Kova Studio Sprint service link`);
    }
    if (dir === "AppHub" && !html.includes("Book Studio Sprint")) {
      failures.push(`${dir}: missing Kova Studio Sprint service CTA`);
    }
    if (dir === "MindMapAI" && !html.includes("../Kova/ai-idea-visualizer/")) {
      failures.push(`${dir}: missing Kova idea-visualizer intent link`);
    }
    if (dir === "MindMapAI" && !html.includes("idea visuals")) {
      failures.push(`${dir}: missing Kova idea-visualizer intent copy`);
    }
    if (dir === "MindMapAI" && !html.includes("../Kova/studio-sprint/?source=mindmapai&package=creator-campaign-system#creator-campaign-system")) {
      failures.push(`${dir}: missing source-aware Kova Studio Sprint service link`);
    }
    if (dir === "MindMapAI" && !html.includes("Book Studio Sprint")) {
      failures.push(`${dir}: missing Kova Studio Sprint service CTA`);
    }
    if (socialKovaIntentDirs.has(dir) && !html.includes("../Kova/ai-dating-profile-picture-generator/")) {
      failures.push(`${dir}: missing Kova dating-profile intent link`);
    }
    if (socialKovaIntentDirs.has(dir) && !html.includes("dating profile pictures")) {
      failures.push(`${dir}: missing Kova dating-profile intent copy`);
    }
    if (petKovaIntentDirs.has(dir) && !html.includes("../Kova/ai-pet-portrait-generator/")) {
      failures.push(`${dir}: missing Kova pet-portrait intent link`);
    }
    if (petKovaIntentDirs.has(dir) && !html.includes("pet portrait")) {
      failures.push(`${dir}: missing Kova pet-portrait intent copy`);
    }
    if (professionalKovaIntentDirs.has(dir) && !html.includes("../Kova/ai-profile-headshot-generator/")) {
      failures.push(`${dir}: missing Kova profile-headshot intent link`);
    }
    if (professionalKovaIntentDirs.has(dir) && !html.includes("profile headshots")) {
      failures.push(`${dir}: missing Kova profile-headshot intent copy`);
    }
    if (toolKovaIntentDirs.has(dir) && !html.includes("../Kova/app-launch-visuals/")) {
      failures.push(`${dir}: missing Kova app-launch visuals intent link`);
    }
    if (toolKovaIntentDirs.has(dir) && !html.includes("app launch visuals")) {
      failures.push(`${dir}: missing Kova app-launch visuals intent copy`);
    }
    if (toolKovaIntentDirs.has(dir)) {
      const source = toolKovaIntentDirs.get(dir);
      const expectedLink = `../Kova/studio-sprint/?source=${source}&package=launch-visual-sprint#launch-visual-sprint`;
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova Studio Sprint service link`);
      }
      if (!html.includes("Book Studio Sprint")) {
        failures.push(`${dir}: missing Kova Studio Sprint service CTA`);
      }
    }
    if (!html.includes("../Kova/download/Icon.png")) {
      failures.push(`${dir}: missing Kova promo icon`);
    }
    if (!html.includes("Open Kova")) {
      failures.push(`${dir}: missing Kova promo CTA`);
    }
    if (!html.includes("20 starter credits")) {
      failures.push(`${dir}: missing Kova starter-credit value`);
    }
    if (!html.includes("2 standard image generations")) {
      failures.push(`${dir}: missing Kova generation-value explanation`);
    }
  }
}

assert.deepEqual(failures, []);

console.log(`App landing page verification passed for ${Object.keys(projectLandingDirs).length} pages`);
