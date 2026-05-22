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
}

assert.deepEqual(failures, []);

console.log(`App landing page verification passed for ${Object.keys(projectLandingDirs).length} pages`);
