import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const downloadPageDirs = {
  Kova: "Kova",
  FriendAI: "FriendAI",
  MindMapAI: "MindMapAI",
  BlahChats: "BlahChat",
  CryptoAI: "CryptoAI",
  CryptoSkills: "CryptoSkills",
  HeartAI: "HeartAI",
  FaceMatch: "faceMatch",
  RizzChat: "Rizzet",
  SecretMinds: "SecretMind",
  CatsDiary: "CatsDiary",
  CatsThoughts: "CatsThoughts",
  DogsThoughts: "DogsThoughts",
  Selah: "Selah",
  Anythoughts: "AnyThoughts",
  GeniePlanner: "GeniePlanner",
  StatUP: "StatUP",
  Lookey: "Lookey",
  OneAI: "OneAI",
  MODEE: "MODEE",
};

const standaloneDownloadPages = {
  MobileCode: {
    file: "MobileCode/download.html",
    canonical: "https://won-space.com/MobileCode/download.html",
    windows: "download/MobileCode.zip",
  },
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

const countOccurrences = (haystack, needle) => haystack.split(needle).length - 1;

const failures = [];

for (const [name, dir] of Object.entries(downloadPageDirs)) {
  const project = projects.get(name) ?? extraProjects.get(name);
  assert.ok(project, `Missing project metadata for ${name}`);

  const file = `${dir}/download/index.html`;
  await access(file);
  const html = await readFile(file, "utf8");
  const canonical = `https://won-space.com/${dir}/download/`;

  if (dir !== "CryptoSkills" && html.includes("CryptoSkills")) {
    failures.push(`${dir}/download: contains stale CryptoSkills copy`);
  }
  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    failures.push(`${dir}/download: missing canonical ${canonical}`);
  }
  if (!html.includes(`property="og:url" content="${canonical}"`)) {
    failures.push(`${dir}/download: missing og:url ${canonical}`);
  }
  const imageUrl = `https://won-space.com/${dir}/download/Icon.png`;
  if (!html.includes(`property="og:image" content="${imageUrl}"`)) {
    failures.push(`${dir}/download: missing og:image ${imageUrl}`);
  }
  const redirectGuard = html.match(/currentUrl\.includes\("won-space\.com\/([^"]+)"\)/)?.[1];
  if (redirectGuard && redirectGuard !== dir) {
    failures.push(`${dir}/download: redirect guard targets ${redirectGuard}`);
  }
  if (!redirectGuard && html.includes("currentUrl.includes(")) {
    failures.push(`${dir}/download: redirect guard does not target ${dir}`);
  }
  if (project.ios && countOccurrences(html, project.ios) < 2) {
    failures.push(`${dir}/download: missing iOS redirect and button URL ${project.ios}`);
  }
  if (!project.ios && /https?:\/\/apps\.apple\.com/.test(html)) {
    failures.push(`${dir}/download: unexpected App Store URL for Android-only app`);
  }
  if (project.android && countOccurrences(html, project.android) < 2) {
    failures.push(`${dir}/download: missing Android redirect and button URL ${project.android}`);
  }
  if (!project.android && /https:\/\/play\.google\.com\/store\/apps\/details/.test(html)) {
    failures.push(`${dir}/download: unexpected Google Play URL for iOS-only app`);
  }
  if (/https?:\/\/apps\.apple\.com/.test(html) && /href="http:\/\/apps\.apple\.com/.test(html)) {
    failures.push(`${dir}/download: App Store link uses http instead of https`);
  }
}

for (const [name, page] of Object.entries(standaloneDownloadPages)) {
  const project = projects.get(name) ?? extraProjects.get(name);
  assert.ok(project, `Missing project metadata for ${name}`);

  await access(page.file);
  const html = await readFile(page.file, "utf8");

  if (!html.includes(`<link rel="canonical" href="${page.canonical}">`)) {
    failures.push(`${page.file}: missing canonical ${page.canonical}`);
  }
  if (!html.includes(`property="og:url" content="${page.canonical}"`)) {
    failures.push(`${page.file}: missing og:url ${page.canonical}`);
  }
  if (project.ios && !html.includes(project.ios)) {
    failures.push(`${page.file}: missing iOS store URL ${project.ios}`);
  }
  if (project.android && !html.includes(project.android)) {
    failures.push(`${page.file}: missing Android store URL ${project.android}`);
  }
  if (page.windows && !html.includes(`href="${page.windows}"`)) {
    failures.push(`${page.file}: missing Windows ZIP download ${page.windows}`);
  }
  if (/href="#"/.test(html)) {
    failures.push(`${page.file}: contains placeholder href="#"`);
  }
  if (/id123456789|com\.won\.mobilecode/.test(html)) {
    failures.push(`${page.file}: contains stale placeholder store URL`);
  }
}

assert.deepEqual(failures, []);

console.log(`Download page verification passed for ${Object.keys(downloadPageDirs).length + Object.keys(standaloneDownloadPages).length} pages`);
