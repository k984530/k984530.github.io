import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html = await readFile("index.html", "utf8");
const urls = [
  ...new Set(
    [...html.matchAll(/https:\/\/(?:apps\.apple\.com|play\.google\.com)[^"']+/g)]
      .map((match) => match[0])
  )
];

assert.ok(urls.length > 0, "No store URLs found in portfolio");

const failures = [];

for (const url of urls) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(12_000),
    });

    if (response.status >= 400) {
      failures.push(`${response.status} ${url}`);
    }
  } catch (error) {
    failures.push(`ERR ${url} ${error.message}`);
  }
}

assert.deepEqual(failures, []);
console.log(`Store link verification passed for ${urls.length} URLs`);
