import { readFile, writeFile } from "node:fs/promises";

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

const appleUrl = /https?:\/\/apps\.apple\.com[^"'<\s)]+/g;
const playUrl = /https:\/\/play\.google\.com\/store\/apps\/details\?id=[^"'<\s)]+/g;

let changed = 0;

for (const [name, dir] of Object.entries(downloadPageDirs)) {
  const project = projects.get(name) ?? extraProjects.get(name);
  const file = `${dir}/download/index.html`;
  let html = await readFile(file, "utf8");
  const original = html;
  const canonical = `https://won-space.com/${dir}/download/`;
  const imageUrl = `https://won-space.com/${dir}/download/Icon.png`;

  if (!html.includes(`<link rel="canonical" href="${canonical}">`)) {
    html = html.replace(
      /(\s*<meta charset="UTF-8">\n)/,
      `$1    <link rel="canonical" href="${canonical}">\n`
    );
  }

  html = html.replace(
    /<meta property="og:url" content="[^"]*">/,
    `<meta property="og:url" content="${canonical}">`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*">/,
    `<meta property="og:image" content="${imageUrl}">`
  );
  html = html.replace(
    /currentUrl\.includes\("won-space\.com\/[^"]+"\)/g,
    `currentUrl.includes("won-space.com/${dir}")`
  );

  if (project.ios) {
    html = html.replace(appleUrl, project.ios);
  } else {
    html = html.replace(
      /\s*<a href="https?:\/\/apps\.apple\.com[^"]*"[^>]*>[\s\S]*?<\/a>\s*(?:<br>\s*)?/g,
      "\n"
    );
    html = html.replace(appleUrl, `https://won-space.com/${dir}/`);
  }

  if (project.android) {
    html = html.replace(playUrl, project.android);
  } else {
    html = html.replace(
      /\s*<a[^>]*href="https:\/\/play\.google\.com\/store\/apps\/details\?id=[^"]*"[^>]*>[\s\S]*?<\/a>\s*/g,
      "\n"
    );
    html = html.replace(playUrl, `https://won-space.com/${dir}/`);
  }

  if (dir !== "CryptoSkills") {
    html = html.replaceAll("CryptoSkills", dir);
  }

  if (html !== original) {
    await writeFile(file, html);
    changed += 1;
  }
}

console.log(`Normalized ${changed} download pages`);
