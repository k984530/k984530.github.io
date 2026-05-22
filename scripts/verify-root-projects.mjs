import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const rootIndex = await readFile("index.html", "utf8");
const projects = [...rootIndex.matchAll(/\{\s*name: "([^"]+)"([\s\S]*?)\s*\}/g)].map(([, name, body]) => ({
  android: body.match(/android: "([^"]+)"/)?.[1],
  detail: body.match(/detail: "([^"]+)"/)?.[1],
  icon: body.match(/icon: "([^"]+)"/)?.[1],
  ios: body.match(/ios: "([^"]+)"/)?.[1],
  name,
}));

const failures = [];

if (/href="#"/.test(rootIndex)) {
  failures.push('root index contains placeholder href="#"');
}
if (!rootIndex.includes('href="https://github.com/k984530"')) {
  failures.push("root index missing GitHub profile link");
}

const requiredDetailRoutes = new Map([
  ["AppHub", "AppHub/"],
  ["MindMapAI", "MindMapAI/"],
]);

for (const [projectName, expectedDetail] of requiredDetailRoutes) {
  const project = projects.find((item) => item.name === projectName);
  if (!project) {
    failures.push(`${projectName}: missing root project entry`);
  } else if (project.detail !== expectedDetail) {
    failures.push(`${projectName}: expected detail route ${expectedDetail}`);
  }
}

for (const project of projects) {
  if (!project.icon) {
    failures.push(`${project.name}: missing icon`);
  } else {
    await access(project.icon).catch(() => failures.push(`${project.name}: missing icon file ${project.icon}`));
  }

  if (project.detail) {
    await access(project.detail).catch(() => failures.push(`${project.name}: missing detail path ${project.detail}`));
  }
}

for (const field of ["ios", "android"]) {
  const seen = new Map();
  for (const project of projects) {
    const url = project[field];
    if (!url) continue;
    seen.set(url, [...(seen.get(url) ?? []), project.name]);
  }

  for (const [url, names] of seen) {
    if (names.length > 1) {
      failures.push(`duplicate ${field} store URL for ${names.join(", ")}: ${url}`);
    }
  }
}

assert.deepEqual(failures, []);

console.log(`Root project verification passed for ${projects.length} projects`);
