import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { access, readFile, stat } from "node:fs/promises";
import path from "node:path";

const repoRoot = process.cwd();

const requiredFiles = [
    "CatsThoughts/index.html",
    "CatsThoughts/terms.html",
    "CatsThoughts/privacy.html",
    "CatsThoughts/support.html",
    "CatsThoughts/download/Icon.png",
];

for (const file of requiredFiles) {
    await access(file);
}

const [rootIndex, sitemap, index, terms, privacy, support] = await Promise.all([
    readFile("index.html", "utf8"),
    readFile("sitemap.xml", "utf8"),
    readFile("CatsThoughts/index.html", "utf8"),
    readFile("CatsThoughts/terms.html", "utf8"),
    readFile("CatsThoughts/privacy.html", "utf8"),
    readFile("CatsThoughts/support.html", "utf8"),
]);

// Root portfolio & sitemap integration
assert.match(rootIndex, /name: "CatsThoughts"/);
assert.match(rootIndex, /detail: "CatsThoughts\/"/);
assert.match(rootIndex, /id6743672789/);
assert.match(rootIndex, /com\.aly\.CatsThoughts/);

assert.match(sitemap, /https:\/\/won-space\.com\/CatsThoughts\//);
assert.match(sitemap, /https:\/\/won-space\.com\/CatsThoughts\/terms\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/CatsThoughts\/privacy\.html/);
assert.match(sitemap, /https:\/\/won-space\.com\/CatsThoughts\/support\.html/);

const pages = {
    "CatsThoughts/index.html": index,
    "CatsThoughts/terms.html": terms,
    "CatsThoughts/privacy.html": privacy,
    "CatsThoughts/support.html": support,
};

// Forbidden phrases (legacy v1 AI claims, false monetization/tracking/server claims, yellow/gold colors)
const forbiddenPatterns = [
    { label: "AdMob mention", regex: /\bAdMob\b/i },
    { label: "RevenueCat mention", regex: /\bRevenueCat\b/i },
    { label: "IDFA mention", regex: /\bIDFA\b/i },
    { label: "AppTrackingTransparency mention", regex: /AppTrackingTransparency/i },
    { label: "External analytics vendor", regex: /Firebase Analytics|Google Analytics|Mixpanel|Amplitude|AppsFlyer/i },
    { label: "Subscription renewal / restore copy", regex: /auto-renewable|자동 갱신|Pro subscription|Pro 구독|Restore Purchases|구매 복원|receipt validation|영수증 검증/i },
    { label: "Paid app model copy", regex: /one-time paid app|단일 유료 구매/i },
    { label: "Cloud sync claim", regex: /cloud sync|클라우드 동기화/i },
    { label: "Legacy v1.0 AI emotion copy", regex: /Cat Emotion Analysis|Thought Translator|alyduho984530@gmail\.com/i },
    { label: "Forbidden gold/yellow color", regex: /\bgold\b|\byellow\b|#ffd700|#fee140|#f59e0b|#eab308|#facc15|#ffdf00|#ffcc00/i },
    { label: "Placeholder anchor link", regex: /href="#"/ },
    { label: "External target=_blank without rel=noopener", regex: /href="https:\/\/[^"]+"[^>]*target="_blank"(?![^>]*rel="noopener")/ },
];

for (const [file, html] of Object.entries(pages)) {
    // Shared bilingual, contact, effective date, and stylesheet checks
    assert.match(html, /href="\.\.\/app-detail\.css"/, `${file}: missing ../app-detail.css`);
    assert.match(html, /id="en"\s+lang="en"/, `${file}: missing English section`);
    assert.match(html, /id="ko"\s+lang="ko"/, `${file}: missing Korean section`);
    assert.match(html, /mailto:hello@choiwon\.dev/, `${file}: missing hello@choiwon.dev mailto`);
    assert.match(html, /hello@choiwon\.dev/, `${file}: missing hello@choiwon.dev text`);
    assert.match(html, /2026-11-25/, `${file}: missing effective date 2026-11-25`);
    assert.match(html, /Cat's Thoughts/, `${file}: missing EN app name`);
    assert.match(html, /고양이의 생각/, `${file}: missing KO app name`);
    assert.match(html, /id6743672789/, `${file}: missing iOS App Store ID`);
    assert.match(html, /com\.aly\.CatsThoughts/, `${file}: missing Android package ID`);
    assert.match(html, /100% free/i, `${file}: missing 100% free EN statement`);
    assert.match(html, /100% 무료/, `${file}: missing 100% 무료 KO statement`);
    assert.match(html, /localStorage/, `${file}: missing localStorage mention`);

    for (const { label, regex } of forbiddenPatterns) {
        assert.doesNotMatch(html, regex, `${file}: forbidden pattern matched (${label})`);
    }
}

// Page-specific assertions
assert.match(index, /<link rel="canonical" href="https:\/\/won-space\.com\/CatsThoughts\/">/);
assert.match(index, /https:\/\/apps\.apple\.com\/app\/id6743672789/);
assert.match(index, /https:\/\/apps\.apple\.com\/app\/cats-thoughts\/id6743672789/);
assert.match(index, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.CatsThoughts/);
assert.match(index, /3D cat tower/i);
assert.match(index, /3D 캣타워/);
assert.match(index, /5 growth stages/i);
assert.match(index, /5단계 성장 무대/);
assert.match(index, /terms\.html/);
assert.match(index, /privacy\.html/);
assert.match(index, /support\.html/);
assert.match(index, /minmax\(min\(100%,/);

assert.match(terms, /<link rel="canonical" href="https:\/\/won-space\.com\/CatsThoughts\/terms\.html">/);
assert.match(terms, /Terms of Service/);
assert.match(terms, /이용약관/);
assert.match(terms, /https:\/\/apps\.apple\.com\/app\/id6743672789/);
assert.match(terms, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.CatsThoughts/);
assert.match(terms, /5 growth stages/i);
assert.match(terms, /5단계 성장 무대/);
assert.match(terms, /no paid in-app purchases/i);
assert.match(terms, /유료 인앱 결제/);
assert.match(terms, /no subscriptions/i);
assert.match(terms, /정기구독/);
assert.match(terms, /no advertisements/i);
assert.match(terms, /광고 없음/);
assert.match(terms, /cannot recover/i);
assert.match(terms, /복구할 수 없습니다/);
assert.match(terms, /privacy\.html/);
assert.match(terms, /support\.html/);

assert.match(privacy, /<link rel="canonical" href="https:\/\/won-space\.com\/CatsThoughts\/privacy\.html">/);
assert.match(privacy, /Privacy Policy/);
assert.match(privacy, /개인정보처리방침/);
assert.match(privacy, /no registration and no login/i);
assert.match(privacy, /회원가입이나 로그인을 요구하지 않으며/);
assert.match(privacy, /AD_ID/);
assert.match(privacy, /광고 ID\(<code>AD_ID<\/code>\)/);
assert.match(privacy, /no third-party analytics|No External Analytics SDKs/i);
assert.match(privacy, /외부 분석 SDK/);
assert.match(privacy, /tower placement, in-game coins, and unlock states/i);
assert.match(privacy, /타워 배치, 코인, 해금 상태/);
assert.match(privacy, /100% locally/i);
assert.match(privacy, /100% 로컬 저장/);
assert.match(privacy, /cannot recover/i);
assert.match(privacy, /복구할 수 없습니다/);
assert.match(privacy, /terms\.html/);
assert.match(privacy, /support\.html/);

assert.match(support, /<link rel="canonical" href="https:\/\/won-space\.com\/CatsThoughts\/support\.html">/);
assert.match(support, /Support/);
assert.match(support, /고객지원/);
assert.match(support, /https:\/\/apps\.apple\.com\/app\/id6743672789/);
assert.match(support, /https:\/\/play\.google\.com\/store\/apps\/details\?id=com\.aly\.CatsThoughts/);
assert.match(support, /minmax\(min\(100%, 300px\), 1fr\)/);
assert.match(support, /cannot recover/i);
assert.match(support, /복구할 수 없/);
assert.match(support, /terms\.html/);
assert.match(support, /privacy\.html/);

// Local HTTP server verification + zero broken internal links/assets
const mimeTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".ico": "image/x-icon",
    ".jpg": "image/jpeg",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".xml": "application/xml; charset=utf-8",
};

const server = createServer(async (req, res) => {
    try {
        const reqUrl = new URL(req.url ?? "/", "http://127.0.0.1");
        let pathname = decodeURIComponent(reqUrl.pathname);
        if (pathname.endsWith("/")) {
            pathname += "index.html";
        }
        const safePath = path.resolve(repoRoot, `.${pathname}`);
        if (!safePath.startsWith(repoRoot)) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
        }
        let targetPath = safePath;
        const info = await stat(targetPath).catch(() => null);
        if (info?.isDirectory()) {
            targetPath = path.join(targetPath, "index.html");
        }
        const body = await readFile(targetPath);
        const ext = path.extname(targetPath).toLowerCase();
        res.writeHead(200, { "Content-Type": mimeTypes[ext] ?? "application/octet-stream" });
        res.end(body);
    } catch {
        res.writeHead(404);
        res.end("Not Found");
    }
});

await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const baseUrl = `http://127.0.0.1:${port}`;

const routePaths = [
    "/CatsThoughts/",
    "/CatsThoughts/terms.html",
    "/CatsThoughts/privacy.html",
    "/CatsThoughts/support.html",
];

async function findChromeBinary() {
    const candidates = [
        process.env.CHROME_BIN,
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
        "/usr/bin/google-chrome",
        "/usr/bin/chromium",
        "/usr/bin/chromium-browser",
    ].filter(Boolean);

    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        } catch {
            // Try next candidate.
        }
    }
    return null;
}

async function runCdpViewportChecks(chromeBin) {
    const chrome = spawn(
        chromeBin,
        [
            "--headless=new",
            "--disable-gpu",
            "--no-sandbox",
            "--remote-debugging-port=0",
            "about:blank",
        ],
        { stdio: ["ignore", "ignore", "pipe"] }
    );

    try {
        const wsEndpoint = await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error("Timed out waiting for Chrome DevTools endpoint")), 10_000);
            let stderrBuf = "";
            chrome.stderr.on("data", (chunk) => {
                stderrBuf += chunk.toString();
                const match = stderrBuf.match(/DevTools listening on (ws:\/\/[^\s]+)/);
                if (match) {
                    clearTimeout(timeout);
                    resolve(match[1]);
                }
            });
            chrome.once("exit", (code) => {
                clearTimeout(timeout);
                reject(new Error(`Chrome exited early with code ${code}: ${stderrBuf}`));
            });
        });

        const debugOrigin = new URL(wsEndpoint);
        const listRes = await fetch(`http://127.0.0.1:${debugOrigin.port}/json/list`);
        const targets = await listRes.json();
        const pageTarget = targets.find((t) => t.type === "page");
        assert.ok(pageTarget?.webSocketDebuggerUrl, "No CDP page target found");

        const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
        await new Promise((resolve, reject) => {
            ws.addEventListener("open", resolve, { once: true });
            ws.addEventListener("error", reject, { once: true });
        });

        let msgId = 0;
        const pending = new Map();
        const eventWaiters = [];

        ws.addEventListener("message", (event) => {
            const data = JSON.parse(event.data);
            if (data.id && pending.has(data.id)) {
                const { resolve, reject } = pending.get(data.id);
                pending.delete(data.id);
                if (data.error) {
                    reject(new Error(data.error.message));
                } else {
                    resolve(data.result);
                }
            } else if (data.method) {
                for (let i = eventWaiters.length - 1; i >= 0; i--) {
                    if (eventWaiters[i].method === data.method) {
                        const waiter = eventWaiters.splice(i, 1)[0];
                        waiter.resolve(data.params);
                    }
                }
            }
        });

        const send = (method, params = {}) =>
            new Promise((resolve, reject) => {
                const id = ++msgId;
                pending.set(id, { resolve, reject });
                ws.send(JSON.stringify({ id, method, params }));
            });

        const waitForEvent = (method, timeoutMs = 10_000) =>
            new Promise((resolve, reject) => {
                const timer = setTimeout(() => reject(new Error(`Timed out waiting for ${method}`)), timeoutMs);
                eventWaiters.push({
                    method,
                    resolve: (params) => {
                        clearTimeout(timer);
                        resolve(params);
                    },
                });
            });

        await send("Page.enable");
        await send("Runtime.enable");

        const viewports = [
            { width: 360, height: 800, mobile: true },
            { width: 375, height: 812, mobile: true },
            { width: 390, height: 844, mobile: true },
            { width: 1280, height: 900, mobile: false },
        ];

        for (const route of routePaths) {
            const url = `${baseUrl}${route}`;
            for (const vp of viewports) {
                await send("Emulation.setDeviceMetricsOverride", {
                    width: vp.width,
                    height: vp.height,
                    deviceScaleFactor: 2,
                    mobile: vp.mobile,
                });
                const loadPromise = waitForEvent("Page.loadEventFired");
                await send("Page.navigate", { url });
                await loadPromise;

                const evalRes = await send("Runtime.evaluate", {
                    returnByValue: true,
                    expression: `(() => {
                        const docWidth = document.documentElement.scrollWidth;
                        const innerWidth = window.innerWidth;
                        const brokenImages = [...document.querySelectorAll("img")]
                            .filter((img) => !img.complete || img.naturalWidth === 0)
                            .map((img) => img.getAttribute("src"));
                        const overflowingElements = [];
                        for (const el of document.querySelectorAll("section, article, header, main, footer, .support-card, .feature-item, .meta-item, .kova-promo, .policy")) {
                            const rect = el.getBoundingClientRect();
                            if (rect.right > innerWidth + 1 || rect.left < -1) {
                                overflowingElements.push({
                                    tag: el.tagName,
                                    cls: el.className,
                                    left: Math.round(rect.left),
                                    right: Math.round(rect.right),
                                    innerWidth,
                                });
                            }
                            const parent = el.parentElement;
                            if (parent) {
                                const pRect = parent.getBoundingClientRect();
                                if (rect.right > pRect.right + 2) {
                                    overflowingElements.push({
                                        tag: el.tagName,
                                        cls: el.className,
                                        right: Math.round(rect.right),
                                        parentRight: Math.round(pRect.right),
                                    });
                                }
                            }
                        }
                        return {
                            docWidth,
                            innerWidth,
                            textLength: document.body.innerText.trim().length,
                            brokenImages,
                            overflowingElements,
                        };
                    })()`,
                });

                const metrics = evalRes.result.value;
                assert.ok(metrics.textLength > 200, `${route} @ ${vp.width}px rendered empty content`);
                assert.deepEqual(metrics.brokenImages, [], `${route} @ ${vp.width}px has broken images`);
                assert.ok(
                    metrics.docWidth <= metrics.innerWidth,
                    `${route} @ ${vp.width}px horizontal overflow: scrollWidth=${metrics.docWidth} > innerWidth=${metrics.innerWidth}`
                );
                assert.deepEqual(
                    metrics.overflowingElements,
                    [],
                    `${route} @ ${vp.width}px overflowing elements: ${JSON.stringify(metrics.overflowingElements)}`
                );
            }
        }

        ws.close();
        return viewports.map((v) => `${v.width}px`).join(", ");
    } finally {
        chrome.kill("SIGTERM");
    }
}

try {
    const brokenLinks = [];
    const htmlCache = new Map();

    // Fetch all 4 routes over HTTP and check all internal links & assets
    for (const route of routePaths) {
        const res = await fetch(`${baseUrl}${route}`);
        assert.equal(res.status, 200, `HTTP ${res.status} for ${route}`);
        const html = await res.text();
        assert.ok(html.length > 500, `Unexpectedly short HTML for ${route}`);
        htmlCache.set(route, html);
    }

    for (const route of routePaths) {
        const html = htmlCache.get(route);
        const refs = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
        for (const ref of refs) {
            if (/^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(ref)) {
                continue;
            }
            const resolved = new URL(ref, `${baseUrl}${route}`);
            const checkUrl = `${resolved.origin}${resolved.pathname}`;
            const targetRes = await fetch(checkUrl);
            if (targetRes.status !== 200) {
                brokenLinks.push(`${route} -> ${ref} (HTTP ${targetRes.status})`);
                continue;
            }
            if (resolved.hash) {
                const fragment = resolved.hash.slice(1);
                const targetHtml = await targetRes.text();
                if (!new RegExp(`id="${fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"`).test(targetHtml)) {
                    brokenLinks.push(`${route} -> ${ref} (missing #${fragment})`);
                }
            }
        }
    }

    assert.deepEqual(brokenLinks, [], `Broken internal links/assets: ${brokenLinks.join("; ")}`);

    const chromeBin = await findChromeBinary();
    if (chromeBin) {
        const checkedViewports = await runCdpViewportChecks(chromeBin);
        console.log(`CatsThoughts public pages verification passed (HTTP + internal links + Chrome render @ ${checkedViewports})`);
    } else {
        console.log("CatsThoughts public pages verification passed (HTTP + internal links; Chrome binary unavailable in this environment)");
    }
} finally {
    server.close();
}
