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
  "AnyThoughts",
  "Anypick",
  "AppHub",
  "BlahChat",
  "CatsDiary",
  "CatsThoughts",
  "ChartingSkills",
  "ChatVibe",
  "CryptoAI",
  "CryptoSkills",
  "DogsThoughts",
  "FriendAI",
  "GeniePlanner",
  "GhostLens",
  "Growvi",
  "HeartAI",
  "Lookey",
  "MindMapAI",
  "MobileCode",
  "MODEE",
  "OneAI",
  "Rizzet",
  "SeductionRules",
  "SecretMind",
  "Selah",
  "StarDiary",
  "StatUP",
  "SweetSleep",
  "VibePlanning",
  "Wealtha",
  "faceMatch",
]);

const socialKovaIntentDirs = new Map([
  ["AnyThoughts", "anythoughts"],
  ["Anypick", "anypick"],
  ["BlahChat", "blahchat"],
  ["ChatVibe", "chatvibe"],
  ["FriendAI", "friendai"],
  ["HeartAI", "heartai"],
  ["Rizzet", "rizzet"],
  ["SeductionRules", "seductionrules"],
  ["SecretMind", "secretmind"],
  ["faceMatch", "facematch"],
]);

const petKovaIntentDirs = new Set([
  "CatsDiary",
  "CatsThoughts",
  "DogsThoughts",
]);

const petKovaIntentPrefillLinks = new Map([
  ["CatsDiary", "../Kova/ai-pet-portrait-generator/?source=catsdiary&package=pet-memory&goal=Pet%20memory%20portrait&petType=Cat&aov=50000&petPhotoLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.CatsDiary&deadline=This%20week&notes=Source%20app%20visitor%20wants%20cat%20portrait#petPortraitBuilder"],
  ["CatsThoughts", "../Kova/ai-pet-portrait-generator/?source=catsthoughts&package=pet-memory&goal=Pet%20memory%20portrait&petType=Cat&aov=50000&petPhotoLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.CatsThoughts&deadline=This%20week&notes=Source%20app%20visitor%20wants%20cat%20portrait#petPortraitBuilder"],
  ["DogsThoughts", "../Kova/ai-pet-portrait-generator/?source=dogsthoughts&package=pet-memory&goal=Pet%20memory%20portrait&petType=Dog&aov=50000&petPhotoLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.DogsThoughts&deadline=This%20week&notes=Source%20app%20visitor%20wants%20dog%20portrait#petPortraitBuilder"],
]);

const professionalKovaIntentDirs = new Map([
  ["ChartingSkills", "chartingskills"],
  ["CryptoAI", "cryptoai"],
  ["CryptoSkills", "cryptoskills"],
  ["Wealtha", "wealtha"],
]);

const professionalKovaIntentPrefillLinks = new Map([
  ["ChartingSkills", "../Kova/ai-profile-headshot-generator/?source=chartingskills&package=professional-refresh&use=Finance%20creator%20profile&aov=100000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.ChartingSkill&deadline=This%20week&notes=Source%20app%20visitor%20wants%20professional%20finance%20headshot#proHeadshotBuilder"],
  ["CryptoAI", "../Kova/ai-profile-headshot-generator/?source=cryptoai&package=professional-refresh&use=Finance%20creator%20profile&aov=100000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.CryptoAI&deadline=This%20week&notes=Source%20app%20visitor%20wants%20professional%20finance%20headshot#proHeadshotBuilder"],
  ["CryptoSkills", "../Kova/ai-profile-headshot-generator/?source=cryptoskills&package=professional-refresh&use=Finance%20creator%20profile&aov=100000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.CryptoSkills&deadline=This%20week&notes=Source%20app%20visitor%20wants%20professional%20finance%20headshot#proHeadshotBuilder"],
  ["Wealtha", "../Kova/ai-profile-headshot-generator/?source=wealtha&package=professional-refresh&use=Finance%20creator%20profile&aov=100000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.Wealtha&deadline=This%20week&notes=Source%20app%20visitor%20wants%20professional%20finance%20headshot#proHeadshotBuilder"],
]);

const journalKovaIntentDirs = new Set([
  "Growvi",
  "Selah",
  "StarDiary",
  "SweetSleep",
]);

const toolKovaIntentDirs = new Map([
  ["GeniePlanner", "genieplanner"],
  ["MobileCode", "mobilecode"],
  ["StatUP", "statup"],
  ["VibePlanning", "vibeplanning"],
]);

const appMakerScreenshotDirs = new Map([
  ["AppHub", "apphub"],
  ["GeniePlanner", "genieplanner"],
  ["MindMapAI", "mindmapai"],
  ["MobileCode", "mobilecode"],
  ["StatUP", "statup"],
  ["VibePlanning", "vibeplanning"],
]);

const appMakerScreenshotPrefillLinks = new Map([
  ["AppHub", "../Kova/ai-app-store-screenshot-service/?source=apphub&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.AppHub#screenshotBriefBuilder"],
  ["GeniePlanner", "../Kova/ai-app-store-screenshot-service/?source=genieplanner&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.GeniePlanner#screenshotBriefBuilder"],
  ["MindMapAI", "../Kova/ai-app-store-screenshot-service/?source=mindmapai&package=creator-campaign-system&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.MindMapAI#screenshotBriefBuilder"],
  ["MobileCode", "../Kova/ai-app-store-screenshot-service/?source=mobilecode&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.MobileCode#screenshotBriefBuilder"],
  ["StatUP", "../Kova/ai-app-store-screenshot-service/?source=statup&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.StatUP#screenshotBriefBuilder"],
  ["VibePlanning", "../Kova/ai-app-store-screenshot-service/?source=vibeplanning&package=launch-visual-sprint&platform=both&slots=8&aov=100000&appUrl=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.VibePlanning#screenshotBriefBuilder"],
]);

const socialKovaIntentPrefillLinks = new Map([
  ["AnyThoughts", "../Kova/ai-dating-profile-picture-generator/?source=anythoughts&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.EmotiCam&deadline=This%20week&notes=Source%20app%20visitor%20wants%20social%20profile%20photo%20refresh#datingSprintBuilder"],
  ["Anypick", "../Kova/ai-dating-profile-picture-generator/?source=anypick&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.anypick&deadline=This%20week&notes=Source%20app%20visitor%20wants%20social%20profile%20photo%20refresh#datingSprintBuilder"],
  ["BlahChat", "../Kova/ai-dating-profile-picture-generator/?source=blahchat&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.BlahChat&deadline=This%20week&notes=Source%20app%20visitor%20wants%20social%20profile%20photo%20refresh#datingSprintBuilder"],
  ["ChatVibe", "../Kova/ai-dating-profile-picture-generator/?source=chatvibe&package=profile-refresh&goal=Dating%20app%20profile%20refresh&aov=50000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.loveExpert&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh#datingSprintBuilder"],
  ["FriendAI", "../Kova/ai-dating-profile-picture-generator/?source=friendai&package=profile-refresh&goal=Dating%20app%20profile%20refresh&aov=50000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.FriendAI&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh#datingSprintBuilder"],
  ["HeartAI", "../Kova/ai-dating-profile-picture-generator/?source=heartai&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.HeartAI&deadline=This%20week&notes=Source%20app%20visitor%20wants%20social%20profile%20photo%20refresh#datingSprintBuilder"],
  ["Rizzet", "../Kova/ai-dating-profile-picture-generator/?source=rizzet&package=profile-refresh&goal=Dating%20app%20profile%20refresh&aov=50000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.rizzChat&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh#datingSprintBuilder"],
  ["SeductionRules", "../Kova/ai-dating-profile-picture-generator/?source=seductionrules&package=profile-refresh&goal=Dating%20app%20profile%20refresh&aov=50000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.SeductionRules&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh#datingSprintBuilder"],
  ["SecretMind", "../Kova/ai-dating-profile-picture-generator/?source=secretmind&package=social-set&goal=Social%20bio%20portrait%20set&aov=75000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.SecretMind&deadline=This%20week&notes=Source%20app%20visitor%20wants%20social%20profile%20photo%20refresh#datingSprintBuilder"],
  ["faceMatch", "../Kova/ai-dating-profile-picture-generator/?source=facematch&package=profile-refresh&goal=Dating%20app%20profile%20refresh&aov=50000&profileLink=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.faceMatch&deadline=This%20week&notes=Source%20app%20visitor%20wants%20profile%20photo%20refresh#datingSprintBuilder"],
]);

const aiPlatformKovaIntentDirs = new Map([
  ["OneAI", "oneai"],
]);

const creatorCampaignKovaIntentDirs = new Map([
  ["GhostLens", "ghostlens"],
]);

const styleKovaIntentDirs = new Map([
  ["Lookey", "lookey"],
  ["MODEE", "modee"],
]);

const styleKovaIntentPrefillLinks = new Map([
  ["Lookey", "../Kova/ai-fashion-photo-generator/?source=lookey&package=outfit-social-set&goal=Style%20profile%20picture%20set&aov=100000&reference=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.Lookey&deadline=This%20week&notes=Source%20app%20visitor%20wants%20style%20profile%20pictures#styleProfileSprintBuilder"],
  ["MODEE", "../Kova/ai-fashion-photo-generator/?source=modee&package=outfit-social-set&goal=Style%20profile%20picture%20set&aov=100000&reference=https%3A%2F%2Fplay.google.com%2Fstore%2Fapps%2Fdetails%3Fid%3Dcom.aly.MODEE&deadline=This%20week&notes=Source%20app%20visitor%20wants%20style%20profile%20pictures#styleProfileSprintBuilder"],
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
    if (appMakerScreenshotDirs.has(dir)) {
      const expectedLink = appMakerScreenshotPrefillLinks.get(dir);
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova screenshot service link`);
      }
      if (!html.includes("App Store screenshots")) {
        failures.push(`${dir}: missing Kova screenshot service intent copy`);
      }
      if (!html.includes("Screenshot service")) {
        failures.push(`${dir}: missing Kova screenshot service CTA`);
      }
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
    if (socialKovaIntentDirs.has(dir)) {
      const source = socialKovaIntentDirs.get(dir);
      const expectedLink = socialKovaIntentPrefillLinks.get(dir) ?? `../Kova/ai-dating-profile-picture-generator/?source=${source}&package=profile-refresh#datingSprintBuilder`;
      if (!html.includes("../Kova/ai-dating-profile-picture-generator/")) {
        failures.push(`${dir}: missing Kova dating-profile intent link`);
      }
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova dating profile sprint link`);
      }
      if (!html.includes("dating profile pictures")) {
        failures.push(`${dir}: missing Kova dating-profile intent copy`);
      }
      if (!html.includes("Profile photo sprint")) {
        failures.push(`${dir}: missing Kova dating profile sprint CTA`);
      }
    }
    if (petKovaIntentDirs.has(dir)) {
      const expectedLink = petKovaIntentPrefillLinks.get(dir);
      if (!html.includes("../Kova/ai-pet-portrait-generator/")) {
        failures.push(`${dir}: missing Kova pet-portrait intent link`);
      }
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova pet portrait sprint link`);
      }
      if (!html.includes("pet portrait")) {
        failures.push(`${dir}: missing Kova pet-portrait intent copy`);
      }
      if (!html.includes("Pet portrait sprint")) {
        failures.push(`${dir}: missing Kova pet portrait sprint CTA`);
      }
    }
    if (professionalKovaIntentDirs.has(dir)) {
      const source = professionalKovaIntentDirs.get(dir);
      const expectedLink = professionalKovaIntentPrefillLinks.get(dir) ?? `../Kova/ai-profile-headshot-generator/?source=${source}&package=professional-refresh#proHeadshotBuilder`;
      if (!html.includes("../Kova/ai-profile-headshot-generator/")) {
        failures.push(`${dir}: missing Kova profile-headshot intent link`);
      }
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova professional headshot sprint link`);
      }
      if (!html.includes("profile headshots")) {
        failures.push(`${dir}: missing Kova profile-headshot intent copy`);
      }
      if (!html.includes("Professional headshot sprint")) {
        failures.push(`${dir}: missing Kova professional headshot sprint CTA`);
      }
    }
    if (journalKovaIntentDirs.has(dir) && !html.includes("../Kova/ai-journal-cover-generator/")) {
      failures.push(`${dir}: missing Kova journal-cover intent link`);
    }
    if (journalKovaIntentDirs.has(dir) && !html.includes("journal cover visuals")) {
      failures.push(`${dir}: missing Kova journal-cover intent copy`);
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
    if (aiPlatformKovaIntentDirs.has(dir)) {
      const source = aiPlatformKovaIntentDirs.get(dir);
      const expectedLink = `../Kova/studio-sprint/?source=${source}&package=creator-campaign-system#creator-campaign-system`;
      if (!html.includes("../Kova/ai-selfie-generator/")) {
        failures.push(`${dir}: missing Kova AI selfie generator intent link`);
      }
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova creator campaign Studio Sprint link`);
      }
      if (!html.includes("AI selfie generator")) {
        failures.push(`${dir}: missing Kova AI selfie generator intent copy`);
      }
      if (!html.includes("Creator campaign sprint")) {
        failures.push(`${dir}: missing Kova creator campaign sprint CTA`);
      }
    }
    if (creatorCampaignKovaIntentDirs.has(dir)) {
      const source = creatorCampaignKovaIntentDirs.get(dir);
      const expectedLink = `../Kova/studio-sprint/?source=${source}&package=creator-campaign-system#creator-campaign-system`;
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova creator campaign Studio Sprint link`);
      }
      if (!html.includes("creator campaign visuals")) {
        failures.push(`${dir}: missing Kova creator campaign intent copy`);
      }
      if (!html.includes("Creator campaign sprint")) {
        failures.push(`${dir}: missing Kova creator campaign sprint CTA`);
      }
    }
    if (styleKovaIntentDirs.has(dir)) {
      const source = styleKovaIntentDirs.get(dir);
      const expectedLink = styleKovaIntentPrefillLinks.get(dir) ?? `../Kova/ai-fashion-photo-generator/?source=${source}&package=outfit-social-set#styleProfileSprintBuilder`;
      if (!html.includes("../Kova/ai-fashion-photo-generator/")) {
        failures.push(`${dir}: missing Kova fashion-photo intent link`);
      }
      if (!html.includes(expectedLink)) {
        failures.push(`${dir}: missing source-aware Kova style profile sprint link`);
      }
      if (!/fashion photo|style profile pictures/i.test(html)) {
        failures.push(`${dir}: missing Kova fashion-photo intent copy`);
      }
      if (!html.includes("style profile pictures")) {
        failures.push(`${dir}: missing Kova style profile intent copy`);
      }
      if (!html.includes("Style profile sprint")) {
        failures.push(`${dir}: missing Kova style profile sprint CTA`);
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
