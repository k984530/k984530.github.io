import { readFile, writeFile } from "node:fs/promises";

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
const projects = new Map();

for (const [, name, body] of rootIndex.matchAll(/\{\s*name: "([^"]+)"([\s\S]*?)\s*\}/g)) {
  projects.set(name, {
    android: body.match(/android: "([^"]+)"/)?.[1],
    ios: body.match(/ios: "([^"]+)"/)?.[1],
  });
}

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

let changed = 0;

for (const [name, dir] of Object.entries(projectLandingDirs)) {
  const project = projects.get(name) ?? extraProjects.get(name);
  const file = `${dir}/index.html`;
  let html = await readFile(file, "utf8");
  const original = html;
  const canonical = `https://won-space.com/${dir}/`;

  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    html = html.replace(
      /(\s*<meta name="keywords" content="[^"]*">\n)/,
      `$1    <link rel="canonical" href="${canonical}">\n`
    );
  }

  if (/<meta property="og:url" content="[^"]*">/.test(html)) {
    html = html.replace(
      /<meta property="og:url" content="[^"]*">/,
      `<meta property="og:url" content="${canonical}">`
    );
  }

  if (project.ios) {
    const appStoreHref = /href="https?:\/\/apps\.apple\.com[^"]*"/;
    if (appStoreHref.test(html)) {
      html = html.replace(appStoreHref, `href="${project.ios}"`);
    }
  }

  if (project.android) {
    const playStoreHref = /href="https:\/\/play\.google\.com\/store\/apps\/details\?id=[^"]*"/;
    if (playStoreHref.test(html)) {
      html = html.replace(playStoreHref, `href="${project.android}"`);
    }
  }

  html = html.replace(
    /<a\b([^>]*href="https:\/\/[^"]+"[^>]*target="_blank")(?![^>]*rel="noopener")([^>]*)>/g,
    "<a$1 rel=\"noopener\"$2>"
  );

  // Some pages repeat store URLs in multiple buttons.
  if (project.ios) {
    html = html.replace(
      new RegExp(`href="https?://apps\\.apple\\.com[^"]*id${project.ios.match(/id(\d+)/)?.[1] ?? ""}"`, "g"),
      `href="${project.ios}"`
    );
  }

  if (project.android) {
    const androidPackage = project.android.match(/id=([^&"]+)/)?.[1];
    if (androidPackage) {
      html = html.replace(
        new RegExp(`href="https://play\\.google\\.com/store/apps/details\\?id=${escapeRegExp(androidPackage)}"`, "g"),
        `href="${project.android}"`
      );
    }
  }

  if (html !== original) {
    await writeFile(file, html);
    changed += 1;
  }
}

console.log(`Normalized ${changed} app landing pages`);
