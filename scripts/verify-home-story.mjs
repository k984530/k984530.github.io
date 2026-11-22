#!/usr/bin/env node
// 첫 화면(index.html)의 숫자 · 날짜 · 채널 목록이 자료(portfolio/apps.json · portfolio/channels.json)에서 계산한 값과 같은지 본다.
// 값은 여기서 따로 다시 계산한다(portfolio/tools/render_apps.py와 같은 규칙). 하나라도 다르면 종료 코드 1.
//   node scripts/verify-home-story.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const html = read("index.html");
const appsDoc = JSON.parse(read("portfolio/apps.json"));
const channelsPath = path.join(root, "portfolio/channels.json");
const channels = fs.existsSync(channelsPath) ? JSON.parse(fs.readFileSync(channelsPath, "utf8")).channels || [] : [];

const failures = [];
const check = (ok, message) => {
    if (!ok) failures.push(message);
};

const apps = [...appsDoc.apps].sort((a, b) => (a.date === b.date ? (a.name < b.name ? -1 : 1) : a.date < b.date ? -1 : 1));
const dotDate = (iso) => iso.replace(/-/g, ".");
const dotMonth = (iso) => iso.slice(0, 7).replace("-", ".");
const first = apps[0];
const latest = apps[apps.length - 1];
const firstYear = Number(first.date.slice(0, 4));
const inFirstYear = apps.filter((a) => Number(a.date.slice(0, 4)) === firstYear);
let gamesStart = apps.length;
while (gamesStart > 0 && apps[gamesStart - 1].genre === "Games") gamesStart -= 1;
const games = apps.slice(gamesStart);
const expected = {
    total: apps.length,
    appStore: apps.filter((a) => a.ios).length,
    googlePlay: apps.filter((a) => a.android).length,
    both: apps.filter((a) => a.ios && a.android).length,
    span: `${dotMonth(first.date)} — ${dotMonth(latest.date)}`,
    firstDate: dotDate(first.date),
    firstTitle: first.title,
    firstYear,
    firstYearCount: inFirstYear.length,
    firstYearRange: `${dotMonth(inFirstYear[0].date)} — ${dotMonth(inFirstYear[inFirstYear.length - 1].date)}`,
    gamesCount: games.length,
    gamesStart,
    gamesRange: games.length ? `${dotDate(games[0].date)} — ${dotDate(games[games.length - 1].date)}` : "",
    latestTitle: latest.title,
    latestDate: dotDate(latest.date),
    next: apps.length + 1,
    channels: channels.length,
    checked: appsDoc.checked,
    checkedLabel: dotDate(appsDoc.checked),
};

// 1) 쪽 안의 자료(appStats)가 다시 계산한 값과 같다.
const statsMatch = html.match(/const appStats = (\{[^\n]*\});/);
check(statsMatch, "index.html: const appStats 를 찾지 못함");
const pageStats = statsMatch ? JSON.parse(statsMatch[1]) : {};
for (const [key, value] of Object.entries(expected)) {
    check(pageStats[key] === value, `appStats.${key}: 쪽 ${JSON.stringify(pageStats[key])} ≠ 계산 ${JSON.stringify(value)}`);
}

// 2) 화면 글자의 data-stat 요소가 모두 그 값이다(손으로 적은 숫자 없음).
const decode = (s) => s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
const statEls = [...html.matchAll(/data-stat="([A-Za-z]+)"[^>]*>([^<]*)</g)];
check(statEls.length >= 10, `data-stat 요소가 ${statEls.length}개뿐`);
for (const [, key, text] of statEls) {
    check(key in expected, `data-stat="${key}": 자료에 없는 열쇠`);
    if (key in expected) check(decode(text) === String(expected[key]), `data-stat="${key}": 화면 "${text}" ≠ 계산 "${expected[key]}"`);
}

// 3) 제목 · 설명의 개수.
const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1] || "";
check(title.includes(`${expected.total} APPS`), `<title> "${title}"에 ${expected.total} APPS 없음`);
for (const m of html.matchAll(/\b(\d+) APPS\b/g)) check(Number(m[1]) === expected.total, `"${m[0]}" ≠ ${expected.total}`);
for (const m of html.matchAll(/\b(\d+) apps\b/g)) check(Number(m[1]) === expected.total, `"${m[0]}" ≠ ${expected.total}`);
for (const m of html.matchAll(/\b(\d+) YouTube channels\b/g)) check(Number(m[1]) === expected.channels, `"${m[0]}" ≠ ${expected.channels}`);

// 4) 앱 목록(HTML) 개수 = 자료 개수, 쪽 자료의 projects 개수 = 자료 개수.
const listCount = (html.match(/<li class="app-item">/g) || []).length;
check(listCount === expected.total, `앱 목록 ${listCount}개 ≠ ${expected.total}`);
const projectsBlock = (html.match(/const projects = \[([\s\S]*?)\n\s*\];/) || [])[1] || "";
const projectCount = (projectsBlock.match(/\{ name: /g) || []).length;
check(projectCount === expected.total, `쪽 자료 projects ${projectCount}개 ≠ ${expected.total}`);

// 5) 채널: 목록 · 쪽 자료 · 프로필 그림. 비어 있으면 구역이 숨겨져 있다. 구독자 수 · 영상 썸네일은 어디에도 없다.
const section = html.match(/<section class="channels" id="channels"( hidden)?/);
check(section, "채널 구역을 찾지 못함");
if (section) check(Boolean(section[1]) === (channels.length === 0), `채널 구역 hidden=${Boolean(section[1])}, 채널 ${channels.length}개`);
const items = [...html.matchAll(/<li class="channel-item"><a class="channel-link" href="([^"]+)" target="_blank" rel="noopener"><img src="([^"]+)"[^>]*><strong[^>]*>([^<]*)<\/strong><span>([^<]*)<\/span>/g)];
check(items.length === channels.length, `채널 목록 ${items.length}개 ≠ 자료 ${channels.length}개`);
const pageChannels = (html.match(/const channels = \[([\s\S]*?)\n\s*\];/) || [])[1] || "";
check((pageChannels.match(/\{ channel: /g) || []).length === channels.length, "쪽 자료 channels 개수가 자료와 다름");
channels.forEach((c, i) => {
    const item = items[i];
    if (item) {
        check(item[1] === c.url, `채널 ${i + 1} 주소 ${item[1]} ≠ ${c.url}`);
        check(decode(item[3]) === c.name, `채널 ${i + 1} 이름 ${item[3]} ≠ ${c.name}`);
        check(decode(item[4]) === c.topic, `채널 ${i + 1} 주제 ${item[4]} ≠ ${c.topic}`);
        check(item[2] === c.avatar, `채널 ${i + 1} 프로필 ${item[2]} ≠ ${c.avatar}`);
    }
    check(/^https:\/\/www\.youtube\.com\/@[A-Za-z0-9_.-]+$/.test(c.url), `채널 ${c.name} 주소 형식: ${c.url}`);
    check(!("thumbs" in c), `채널 ${c.name}: 자료에 썸네일 항목이 남아 있음`);
    check(!/^https?:/.test(c.avatar), `채널 ${c.name} 프로필을 바깥 주소로 씀: ${c.avatar}`);
    check(fs.existsSync(path.join(root, c.avatar)), `채널 ${c.name} 프로필 파일 없음: ${c.avatar}`);
    check(pageChannels.includes(JSON.stringify(c.avatar)), `쪽 자료에 프로필 경로 없음: ${c.avatar}`);
});
check(!/thumbs/.test(pageChannels), "쪽 자료 channels에 썸네일 항목이 남아 있음");
// 채널 그림 폴더에는 자료가 쓰는 프로필만 있다(지운 썸네일이 남지 않게).
const channelDir = path.join(root, "portfolio/channels");
if (fs.existsSync(channelDir)) {
    const used = new Set(channels.map((c) => path.basename(c.avatar)));
    for (const file of fs.readdirSync(channelDir)) check(used.has(file), `portfolio/channels/${file}: 자료가 쓰지 않는 파일`);
}
check(!/subscriber|구독자/i.test(html), "index.html에 구독자 표기가 있음");

// 6) 쉼(빈 달) 장면은 없다.
check(!/id="chPause"/.test(html), "쉼 장면(chPause)이 남아 있음");

if (failures.length) {
    console.error(`verify-home-story: ${failures.length}건 실패`);
    failures.forEach((f) => console.error(`  - ${f}`));
    process.exit(1);
}
console.log(`verify-home-story: 통과 (앱 ${expected.total} · App Store ${expected.appStore} · Google Play ${expected.googlePlay} · ${expected.firstYear}년 ${expected.firstYearCount} · 게임 ${expected.gamesCount} · 채널 ${expected.channels}(프로필만) · data-stat ${statEls.length}곳)`);
