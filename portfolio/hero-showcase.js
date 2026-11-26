// won-space.com 3D Monograph Showcase Hero
// Reinterprets an interactive 3D showcase triptych & inspection stage
// in won-space.com's obsidian gallery language using real portfolio app data (window.WON).
import {
    BackSide,
    BoxGeometry,
    BufferGeometry,
    Euler,
    Fog,
    LinearFilter,
    LinearMipmapLinearFilter,
    Mesh,
    MeshBasicMaterial,
    MeshPhysicalMaterial,
    NeutralToneMapping,
    PerspectiveCamera,
    PlaneGeometry,
    PMREMGenerator,
    Raycaster,
    Scene,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "./lib/three-0.186.1.min.js?v=20261122k";

const W = window.WON;
const heroEl = document.getElementById("hero");
const canvas = document.getElementById("showcaseScene");
const backdropKicker = document.getElementById("showcaseWordKicker");
const captionKicker = document.getElementById("showcaseCaptionKicker");
const captionTitle = document.getElementById("showcaseCaptionTitle");
const captionSub = document.getElementById("showcaseCaptionSub");
const dotsWrap = document.getElementById("showcaseDots");
const prevBtn = document.getElementById("showcasePrev");
const nextBtn = document.getElementById("showcaseNext");
const inspectCta = document.getElementById("showcaseInspectCta");
const closeBtn = document.getElementById("showcaseClose");
const a11yTriggers = document.getElementById("showcaseA11yTriggers");
const fallbackWrap = document.getElementById("showcaseFallback");

// Detail inspection panel elements
const inspectPanel = document.getElementById("inspectPanel");
const inspectKicker = document.getElementById("inspectKicker");
const inspectCatalogNo = document.getElementById("inspectCatalogNo");
const inspectIcon = document.getElementById("inspectIcon");
const inspectTitle = document.getElementById("inspectTitle");
const inspectLead = document.getElementById("inspectLead");
const inspectNotes = document.getElementById("inspectNotes");
const inspectTags = document.getElementById("inspectTags");
const inspectStatus = document.getElementById("inspectStatus");
const inspectDate = document.getElementById("inspectDate");
const inspectPrimary = document.getElementById("inspectPrimary");
const inspectIos = document.getElementById("inspectIos");
const inspectAndroid = document.getElementById("inspectAndroid");
const inspectPrev = document.getElementById("inspectPrev");
const inspectNext = document.getElementById("inspectNext");

// Archive drawer elements
const archiveToggle = document.getElementById("archiveToggle");
const archiveDrawer = document.getElementById("archiveDrawer");
const archiveClose = document.getElementById("archiveClose");
const archiveFilters = document.getElementById("archiveFilters");
const archiveGrid = document.getElementById("archiveGrid");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

// Curated editorial editions grounded in real won-space.com apps & subpages
const FEATURED_EDITIONS = [
    {
        projectName: "AnyPick",
        edition: "I",
        subtitle: "The First Release · Anonymous Compliments",
        tone: "#121318",
        accent: "#56CCF2",
        summary: "The debut application that opened the won-space.com catalog in February 2025 — a lightweight social space for exchanging anonymous compliments and quiet daily encouragement.",
        notes: [
            { title: "Studio Origin", text: "Catalog entry #01 of 43. Shipped simultaneously to both the Apple App Store and Google Play on 2025.02.18." },
            { title: "Core Ritual", text: "Send short, frictionless compliments anonymously to brighten everyday moments without algorithmic noise." },
            { title: "Dedicated Web Home", text: "Includes a full standalone landing page on won-space.com/Anypick/ with direct platform links." },
        ],
        tags: ["First Release", "Lifestyle", "iOS & Android", "2025"],
    },
    {
        projectName: "Kova",
        edition: "II",
        subtitle: "AI Photo Studio · Share-Ready Styles",
        tone: "#141216",
        accent: "#FF5C7A",
        summary: "Flagship 2026 AI photo editor that turns a single portrait into collectible figurines, anime portraits, Polaroids, and cyberpunk compositions straight from mobile.",
        notes: [
            { title: "One Photo, Multiple Editions", text: "Transform everyday photos into stylized figurines, retro Polaroids, anime frames, and studio portraits." },
            { title: "Starter Credits Built In", text: "New accounts include 20 starter credits out of the box so visitors can test image generations immediately." },
            { title: "Expanded Web Suite", text: "Backed by dedicated launch-visual and studio workflow pages under won-space.com/Kova/." },
        ],
        tags: ["Flagship 2026", "Photo & Video", "AI Imaging", "iOS & Android"],
    },
    {
        projectName: "MobileCode",
        edition: "III",
        subtitle: "Remote Desktop & Pocket Terminal",
        tone: "#101417",
        accent: "#38BDF8",
        summary: "Built for developers away from their desk: stream your macOS or Windows workstation, open a live terminal, and keep coding directly from a phone or tablet.",
        notes: [
            { title: "Two-Step Workstation Link", text: "Install the lightweight macOS or Windows desktop server and pair instantly with the mobile client." },
            { title: "Terminal + Desktop Stream", text: "Inspect builds, run shell sessions, and steer desktop windows seamlessly on mobile screens." },
            { title: "Cross-Platform Footprint", text: "Shipped across iOS, Android, macOS, and Windows with dedicated downloads at won-space.com/MobileCode/." },
        ],
        tags: ["Developer Tools", "Remote Desktop", "Terminal", "iOS & Android"],
    },
    {
        projectName: "StarDiary",
        edition: "IV",
        subtitle: "Stella Notes · Private Nightly Journal",
        tone: "#101119",
        accent: "#A78BFA",
        summary: "A calm, private reflection journal designed for late-night writing — collect quiet thoughts and revisit past entries beneath a minimalist starry canvas.",
        notes: [
            { title: "Quiet Reflection Space", text: "Crafted for calm nightly entries without social feeds, streaks, or intrusive popups." },
            { title: "Year-End 2025 Capstone", text: "Closed out the 31-app 2025 release wave on 2025.12.26 with a refined one-time product direction." },
            { title: "Bilingual Legal & Support", text: "Maintains full standalone privacy, terms, and support documentation at won-space.com/StarDiary/." },
        ],
        tags: ["Lifestyle", "Private Journal", "2025 Capstone", "iOS & Android"],
    },
    {
        projectName: "CatsThoughts",
        edition: "V",
        subtitle: "2.0 · 3D Cat Tower Building Game",
        tone: "#151311",
        accent: "#F59E0B",
        summary: "Reimagined in 2.0 as a 100% free 3D cat tower building game across five growth stages — zero ads, zero paid IAP, zero accounts, and 100% local on-device storage.",
        notes: [
            { title: "Five Growth Stages", text: "Build, expand, and customize vertical 3D cat towers as your feline companions evolve." },
            { title: "Zero-Friction Privacy", text: "No ads, no subscriptions, no logins — every save stays locally on your own device." },
            { title: "Bilingual 2.0 Portal", text: "Complete English & Korean landing, support, and policy pages live at won-space.com/CatsThoughts/." },
        ],
        tags: ["2.0 Edition", "3D Game", "Zero Ads", "Local Storage"],
    },
    {
        projectName: "Starlight",
        edition: "VI",
        subtitle: "Hardcore Tower TD · 2026 Games Wave",
        tone: "#12101A",
        accent: "#818CF8",
        summary: "Opened won-space.com's autumn 2026 eight-game sprint — a crisp, demanding tower defense challenge tuned for rapid tactical runs on mobile.",
        notes: [
            { title: "Autumn 2026 Games Sprint", text: "First of 8 consecutive game launches between 2026.09.29 and 2026.11.05." },
            { title: "Tactical Mobile Pace", text: "Engineered for high-stakes wave defense sessions with tight placement economy." },
            { title: "Dual Store Launch", text: "Available directly on both the Apple App Store and Google Play." },
        ],
        tags: ["Games Wave", "Tower Defense", "2026", "iOS & Android"],
    },
];

const clamp = (v, min, max) => (v < min ? min : v > max ? max : v);
const lerp = (a, b, t) => a + (b - a) * t;

function hasKorean(str) {
    return /[가-힣]/.test(str || "");
}

function formatDate(iso) {
    return (iso || "").replace(/-/g, ".");
}

function platformLabel(project) {
    const parts = [];
    if (project.ios) parts.push("iOS");
    if (project.android) parts.push("Android");
    return parts.join(" · ") || "Web";
}

function buildEntryForProject(project, catalogIndex, totalCount) {
    const featured = FEATURED_EDITIONS.find((f) => f.projectName === project.name);
    const catalogNo = `#${String(catalogIndex + 1).padStart(2, "0")} / ${totalCount}`;
    if (featured) {
        return {
            project,
            catalogIndex,
            catalogNo,
            edition: featured.edition,
            kicker: `Edition ${featured.edition} · ${project.genre || "App"}`,
            subtitle: featured.subtitle,
            tone: featured.tone,
            accent: featured.accent,
            summary: featured.summary,
            notes: featured.notes,
            tags: featured.tags,
        };
    }

    const subtitle = project.storeTitle && project.storeTitle !== project.title
        ? project.storeTitle.replace(new RegExp(`^${project.title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*[:\\-–·]?\\s*`, "i"), "") || project.genre || "Mobile Application"
        : `${project.genre || "Mobile App"} · ${project.year}`;

    const stores = [];
    if (project.ios) stores.push("Apple App Store");
    if (project.android) stores.push("Google Play");

    return {
        project,
        catalogIndex,
        catalogNo,
        edition: String(catalogIndex + 1).padStart(2, "0"),
        kicker: `Archive ${String(catalogIndex + 1).padStart(2, "0")} · ${project.genre || "App"}`,
        subtitle,
        tone: "#121216",
        accent: "#EF1D2D",
        summary: `${project.storeTitle || project.title} is release ${catalogNo} in the won-space.com catalog, published in ${formatDate(project.date)} under ${project.genre || "Mobile Apps"}.`,
        notes: [
            { title: "Catalog Position", text: `Released ${formatDate(project.date)} as entry #${catalogIndex + 1} of ${totalCount} shipped applications on won-space.com.` },
            { title: "Store Distribution", text: stores.length ? `Live on ${stores.join(" and ")}.` : "Published through won-space.com." },
            { title: "Landing & Resources", text: project.detail ? `Dedicated product page and documentation hosted at won-space.com/${project.detail}` : "Direct store distribution with icon and catalog telemetry tracked in the main archive." },
        ],
        tags: [project.genre || "App", String(project.year), ...platformLabel(project).split(" · ")],
    };
}

function webgl2Available() {
    try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch {
        return false;
    }
}

// ---------- Procedural High-DPI Cover, Spine & Page-Edge Artwork ----------

function roundedRectPath(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

function drawCoverCanvas(entry, iconImage) {
    const cw = 768;
    const ch = 1080;
    const c = document.createElement("canvas");
    c.width = cw;
    c.height = ch;
    const ctx = c.getContext("2d");

    // 1. Deep obsidian monograph stock with gentle top-light gradient
    const bgGrad = ctx.createLinearGradient(0, 0, cw * 0.7, ch);
    bgGrad.addColorStop(0, "#1C1C22");
    bgGrad.addColorStop(0.42, entry.tone || "#121216");
    bgGrad.addColorStop(1, "#09090B");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Subtle radial ambient glow behind emblem
    const cx = cw / 2;
    const emblemY = 604;
    const radGrad = ctx.createRadialGradient(cx, emblemY, 24, cx, emblemY, 340);
    radGrad.addColorStop(0, "rgba(255, 255, 255, 0.14)");
    radGrad.addColorStop(0.45, "rgba(255, 255, 255, 0.04)");
    radGrad.addColorStop(1, "rgba(8, 8, 8, 0)");
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, cw, ch);

    // Subtle tactile paper/anodized micro-grain
    ctx.fillStyle = "rgba(255, 255, 255, 0.018)";
    for (let y = 0; y < ch; y += 6) {
        ctx.fillRect(0, y, cw, 1);
    }

    // 2. Architectural double frame & Swiss registration marks
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, cw - 56, ch - 56);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
    ctx.lineWidth = 1;
    ctx.strokeRect(46, 46, cw - 92, ch - 92);

    // Corner L-brackets
    ctx.strokeStyle = "rgba(255, 255, 255, 0.56)";
    ctx.lineWidth = 2.5;
    const corners = [
        [28, 28, 1, 1],
        [cw - 28, 28, -1, 1],
        [28, ch - 28, 1, -1],
        [cw - 28, ch - 28, -1, -1],
    ];
    for (const [x, y, dx, dy] of corners) {
        ctx.beginPath();
        ctx.moveTo(x, y + dy * 22);
        ctx.lineTo(x, y);
        ctx.lineTo(x + dx * 22, y);
        ctx.stroke();
    }

    // 3. Top archival kicker + signature won-space red dot
    ctx.fillStyle = "#EF1D2D";
    ctx.beginPath();
    ctx.arc(cx, 88, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 255, 255, 0.56)";
    ctx.font = '500 18px "Jost", "IBM Plex Sans KR", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const kickerText = `WON ARCHIVE  ·  EDITION ${entry.edition}`.toUpperCase();
    ctx.fillText(kickerText, cx, 126);

    // Thin divider beneath kicker
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 88, 152);
    ctx.lineTo(cx + 88, 152);
    ctx.stroke();

    // 4. Editorial Cormorant Garamond Title
    const title = entry.project.title || entry.project.name;
    const isKo = hasKorean(title);
    const maxTitleW = cw - 148;
    let fontSize = isKo ? 72 : 84;
    const titleFamily = isKo
        ? '"IBM Plex Sans KR", "Jost", sans-serif'
        : '"Cormorant Garamond", Georgia, serif';
    ctx.font = `${isKo ? "500" : "400"} ${fontSize}px ${titleFamily}`;
    while (ctx.measureText(title).width > maxTitleW && fontSize > 42) {
        fontSize -= 4;
        ctx.font = `${isKo ? "500" : "400"} ${fontSize}px ${titleFamily}`;
    }
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(title, cx, 234);

    // Subtitle in italic editorial serif
    ctx.fillStyle = "rgba(255, 255, 255, 0.66)";
    ctx.font = 'italic 400 28px "Cormorant Garamond", "IBM Plex Sans KR", Georgia, serif';
    const sub = entry.subtitle.length > 42 ? `${entry.subtitle.slice(0, 41)}…` : entry.subtitle;
    ctx.fillText(sub, cx, 294);

    // 5. Centerpiece Geometric Medallion & Real App Icon
    // Crosshair axes
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(68, emblemY);
    ctx.lineTo(cw - 68, emblemY);
    ctx.moveTo(cx, 356);
    ctx.lineTo(cx, 852);
    ctx.stroke();

    // Concentric technical rings
    const ringRadii = [238, 198, 156];
    ringRadii.forEach((r, idx) => {
        ctx.strokeStyle = idx === 1 ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.09)";
        ctx.lineWidth = idx === 1 ? 1.5 : 1;
        ctx.beginPath();
        ctx.arc(cx, emblemY, r, 0, Math.PI * 2);
        ctx.stroke();
    });

    // 36 precision dial ticks on middle ring
    ctx.strokeStyle = "rgba(255, 255, 255, 0.24)";
    ctx.lineWidth = 1.2;
    for (let i = 0; i < 36; i += 1) {
        const a = (i / 36) * Math.PI * 2;
        const inner = i % 3 === 0 ? 186 : 192;
        const outer = 204;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * inner, emblemY + Math.sin(a) * inner);
        ctx.lineTo(cx + Math.cos(a) * outer, emblemY + Math.sin(a) * outer);
        ctx.stroke();
    }

    // Small cardinal diamond markers
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    for (let i = 0; i < 4; i += 1) {
        const a = (i * Math.PI) / 2;
        const rx = cx + Math.cos(a) * 238;
        const ry = emblemY + Math.sin(a) * 238;
        ctx.save();
        ctx.translate(rx, ry);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.restore();
    }

    // Real App Icon inlaid inside squircle medallion
    const iconSize = 248;
    const iconX = cx - iconSize / 2;
    const iconY = emblemY - iconSize / 2;
    const iconR = 56;

    // Soft plinth shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
    ctx.shadowBlur = 42;
    ctx.shadowOffsetY = 18;
    roundedRectPath(ctx, iconX, iconY, iconSize, iconSize, iconR);
    ctx.fillStyle = "#121216";
    ctx.fill();
    ctx.restore();

    // Draw real app icon clipped cleanly
    ctx.save();
    roundedRectPath(ctx, iconX, iconY, iconSize, iconSize, iconR);
    ctx.clip();
    if (iconImage && iconImage.complete && iconImage.naturalWidth > 0) {
        ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
    } else {
        ctx.fillStyle = "#18181E";
        ctx.fillRect(iconX, iconY, iconSize, iconSize);
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.font = '300 72px "Cormorant Garamond", serif';
        ctx.fillText(title.slice(0, 2).toUpperCase(), cx, emblemY);
    }
    // Delicate top-edge glass gloss
    const gloss = ctx.createLinearGradient(iconX, iconY, iconX, iconY + iconSize * 0.45);
    gloss.addColorStop(0, "rgba(255, 255, 255, 0.2)");
    gloss.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gloss;
    ctx.fillRect(iconX, iconY, iconSize, iconSize * 0.45);
    ctx.restore();

    // Crisp silver rim around icon
    roundedRectPath(ctx, iconX, iconY, iconSize, iconSize, iconR);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.36)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // 6. Bottom Colophon Plate
    ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(88, 926);
    ctx.lineTo(cw - 88, 926);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.74)";
    ctx.font = '500 17px "Jost", "IBM Plex Sans KR", sans-serif';
    const metaLine = `${formatDate(entry.project.date)}   ·   ${(entry.project.genre || "APP").toUpperCase()}   ·   ${platformLabel(entry.project).toUpperCase()}`;
    ctx.fillText(metaLine, cx, 964);

    ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
    ctx.font = '500 14px "Jost", sans-serif';
    ctx.fillText(`WON-SPACE.COM  ·  CATALOG ${entry.catalogNo}`, cx, 1002);

    return c.toDataURL("image/png");
}

function drawSpineTexture(entry) {
    const c = document.createElement("canvas");
    c.width = 96;
    c.height = 1024;
    const ctx = c.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 96, 0);
    grad.addColorStop(0, "#0A0A0D");
    grad.addColorStop(0.5, "#1A1A20");
    grad.addColorStop(1, "#0B0B0E");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 96, 1024);

    // Crown red band
    ctx.fillStyle = "#EF1D2D";
    ctx.fillRect(14, 72, 68, 5);

    // Subtle vertical silver rules
    ctx.fillStyle = "rgba(255, 255, 255, 0.22)";
    ctx.fillRect(14, 104, 68, 1);
    ctx.fillRect(14, 924, 68, 1);

    // Vertical spine title
    ctx.save();
    ctx.translate(48, 512);
    ctx.rotate(Math.PI / 2);
    ctx.fillStyle = "rgba(255, 255, 255, 0.78)";
    ctx.font = '500 22px "Jost", "IBM Plex Sans KR", sans-serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const spineText = `${entry.project.title.toUpperCase()}   ·   ${entry.project.year}`;
    ctx.fillText(spineText.slice(0, 28), 0, 0);
    ctx.restore();

    return c.toDataURL("image/png");
}

function drawPageEdgeTexture() {
    const c = document.createElement("canvas");
    c.width = 128;
    c.height = 512;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#C4C4CC";
    ctx.fillRect(0, 0, 128, 512);

    // Fine vertical sheet striations (representing stacked silver-ivory archival folios)
    for (let x = 0; x < 128; x += 4) {
        ctx.fillStyle = x % 8 === 0 ? "rgba(18, 18, 22, 0.42)" : "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(x, 0, 2, 512);
    }
    return c.toDataURL("image/png");
}

// ---------- Studio Lighting Environment ----------

function buildStudioEnvironment(renderer, size) {
    const envScene = new Scene();
    const room = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0x09090b, side: BackSide })
    );
    room.scale.set(90, 60, 90);
    envScene.add(room);

    const panels = [
        // Wide soft key overhead
        { w: 46, h: 10, color: 0xfffdf8, intensity: 2.8, pos: [0, 20, 16], look: [0, 0, 0] },
        // Front-left sculpted key
        { w: 12, h: 36, color: 0xf4f6fa, intensity: 3.6, pos: [-26, 6, 18], look: [0, 0, 0] },
        // Right crisp silver rim (illuminates page edge & fanned folios)
        { w: 8, h: 34, color: 0xffffff, intensity: 4.0, pos: [26, 5, 10], look: [0, 0, 0] },
        // Back subtle halo
        { w: 30, h: 8, color: 0xd8dce4, intensity: 1.5, pos: [0, 10, -28], look: [0, 0, 0] },
        // Subtle signature red floor whisper
        { w: 22, h: 4, color: 0xef1d2d, intensity: 0.48, pos: [0, -14, 16], look: [0, 0, 0] },
    ];

    for (const p of panels) {
        const mat = new MeshBasicMaterial({ color: p.color });
        mat.color.multiplyScalar(p.intensity);
        const mesh = new Mesh(new PlaneGeometry(p.w, p.h), mat);
        mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
        mesh.lookAt(p.look[0], p.look[1], p.look[2]);
        envScene.add(mesh);
    }

    const pmrem = new PMREMGenerator(renderer);
    const envMap = pmrem.fromScene(envScene, 0, 0.1, 180, { size }).texture;
    pmrem.dispose();
    envScene.traverse((obj) => {
        if (obj.isMesh) {
            obj.geometry.dispose();
            obj.material.dispose();
        }
    });
    return envMap;
}

// ---------- Main Showcase Engine ----------

function initShowcase() {
    if (!W || !heroEl) return;

    const sortedProjects = [...W.projects].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const allEntries = sortedProjects.map((project, idx) => buildEntryForProject(project, idx, sortedProjects.length));

    // Build the 6 curated flagship carousel entries
    const flagshipEntries = FEATURED_EDITIONS
        .map((f) => allEntries.find((e) => e.project.name === f.projectName))
        .filter(Boolean);

    // Default center index = 1 (Kova: flagship 2026 center, flanked by AnyPick & Mobile Code)
    let activeCarousel = Math.min(1, Math.max(0, flagshipEntries.length - 1));
    let inspectedEntry = null;
    let inspectedIndexInAll = -1;
    let activeGenreFilter = "All";

    // Render carousel indicator dots
    const dotButtons = [];
    if (dotsWrap) {
        dotsWrap.textContent = "";
        flagshipEntries.forEach((entry, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "showcase-dot";
            btn.setAttribute("aria-label", `Focus ${entry.project.title}`);
            btn.addEventListener("click", () => {
                setCarouselIndex(idx);
            });
            dotsWrap.appendChild(btn);
            dotButtons.push(btn);
        });
    }

    // Accessible keyboard triggers for flagship editions
    if (a11yTriggers) {
        a11yTriggers.textContent = "";
        flagshipEntries.forEach((entry, idx) => {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "showcase-a11y-btn";
            btn.textContent = `Inspect ${entry.project.title} (Edition ${entry.edition})`;
            btn.addEventListener("click", () => {
                setCarouselIndex(idx);
                openInspection(entry);
            });
            a11yTriggers.appendChild(btn);
        });
    }

    // Build WebGL fallback triptych synced with activeCarousel (shown when .no-webgl is active)
    function renderFallbackTriptych() {
        if (!fallbackWrap || !flagshipEntries.length) return;
        fallbackWrap.textContent = "";
        const n = flagshipEntries.length;
        [-1, 0, 1].forEach((offset) => {
            const slotIdx = ((activeCarousel + offset) % n + n) % n;
            const entry = flagshipEntries[slotIdx];
            if (!entry) return;
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "fallback-monograph";
            if (offset === 0) btn.setAttribute("aria-current", "true");

            const editionSpan = document.createElement("span");
            editionSpan.textContent = `Edition ${entry.edition}`;

            const img = document.createElement("img");
            img.src = entry.project.icon;
            img.alt = "";
            img.width = 84;
            img.height = 84;

            const strong = document.createElement("strong");
            strong.textContent = entry.project.title;
            if (hasKorean(entry.project.title)) strong.lang = "ko";

            const metaSpan = document.createElement("span");
            metaSpan.textContent = `${formatDate(entry.project.date)} · ${entry.project.genre || "App"}`;

            btn.append(editionSpan, img, strong, metaSpan);
            btn.addEventListener("click", () => {
                setCarouselIndex(slotIdx);
                openInspection(entry);
            });
            fallbackWrap.appendChild(btn);
        });
    }
    renderFallbackTriptych();

    // ---------- Archive Drawer Logic (All 43 Apps) ----------
    const genreOrder = ["All", "Games", "Lifestyle", "Entertainment", "Finance", "Productivity", "Developer Tools", "Photo & Video", "Health & Fitness", "Social Networking"];
    const presentGenres = genreOrder.filter((g) => g === "All" || allEntries.some((e) => e.project.genre === g));

    const archiveFilterButtons = [];

    function renderArchiveFilters() {
        if (!archiveFilters) return;
        if (!archiveFilterButtons.length) {
            archiveFilters.textContent = "";
            presentGenres.forEach((genre) => {
                const count = genre === "All"
                    ? allEntries.length
                    : allEntries.filter((e) => e.project.genre === genre).length;
                const btn = document.createElement("button");
                btn.type = "button";
                btn.className = "archive-filter-btn";
                btn.dataset.genre = genre;
                btn.textContent = `${genre} (${count})`;
                btn.addEventListener("click", () => {
                    activeGenreFilter = genre;
                    renderArchiveFilters();
                    renderArchiveList();
                });
                archiveFilters.appendChild(btn);
                archiveFilterButtons.push(btn);
            });
        }
        archiveFilterButtons.forEach((btn) => {
            const active = btn.dataset.genre === activeGenreFilter;
            btn.classList.toggle("is-active", active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
        });
    }

    function renderArchiveList() {
        if (!archiveGrid) return;
        archiveGrid.textContent = "";
        const filtered = activeGenreFilter === "All"
            ? [...allEntries].reverse()
            : allEntries.filter((e) => e.project.genre === activeGenreFilter).reverse();

        filtered.forEach((entry) => {
            const li = document.createElement("li");
            li.className = "archive-row";

            const img = document.createElement("img");
            img.src = entry.project.icon;
            img.alt = "";
            img.width = 44;
            img.height = 44;
            img.loading = "lazy";

            const info = document.createElement("div");
            info.className = "archive-row-info";
            const nameEl = document.createElement("span");
            nameEl.className = "archive-row-title";
            nameEl.textContent = entry.project.title;
            if (hasKorean(entry.project.title)) nameEl.lang = "ko";
            const metaEl = document.createElement("span");
            metaEl.className = "archive-row-meta";
            metaEl.textContent = `${formatDate(entry.project.date)} · ${entry.project.genre || "App"} · ${platformLabel(entry.project)}`;
            info.append(nameEl, metaEl);

            const inspectBtn = document.createElement("button");
            inspectBtn.type = "button";
            inspectBtn.className = "archive-row-inspect";
            inspectBtn.textContent = "Inspect";
            inspectBtn.addEventListener("click", () => {
                closeArchiveDrawer(false);
                openInspection(entry);
                if (closeBtn) {
                    void heroEl.offsetHeight;
                    closeBtn.focus();
                }
            });

            li.append(img, info, inspectBtn);
            archiveGrid.appendChild(li);
        });
    }

    const skipLink = document.querySelector(".skip-link");
    const pageHeader = document.querySelector(".site-header");
    const pageMain = document.querySelector("main");
    let drawerReturnFocus = null;

    function setBackgroundInert(isInert) {
        [skipLink, pageHeader, pageMain].forEach((el) => {
            if (!el) return;
            el.inert = isInert;
            if (isInert) el.setAttribute("aria-hidden", "true");
            else el.removeAttribute("aria-hidden");
        });
    }

    function drawerFocusables() {
        if (!archiveDrawer) return [];
        return [...archiveDrawer.querySelectorAll('button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')];
    }

    function openArchiveDrawer() {
        if (!archiveDrawer) return;
        drawerReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : archiveToggle;
        renderArchiveFilters();
        renderArchiveList();
        archiveDrawer.classList.add("is-open");
        archiveDrawer.setAttribute("aria-hidden", "false");
        setBackgroundInert(true);
        if (archiveToggle) archiveToggle.setAttribute("aria-expanded", "true");
        if (archiveClose) {
            void archiveDrawer.offsetHeight;
            archiveClose.focus();
        }
    }

    function closeArchiveDrawer(restoreFocus = true) {
        if (!archiveDrawer) return;
        archiveDrawer.classList.remove("is-open");
        archiveDrawer.setAttribute("aria-hidden", "true");
        setBackgroundInert(false);
        if (archiveToggle) archiveToggle.setAttribute("aria-expanded", "false");
        if (restoreFocus) {
            const target = drawerReturnFocus || archiveToggle;
            if (target && typeof target.focus === "function") target.focus();
        }
        drawerReturnFocus = null;
    }

    if (archiveToggle) {
        archiveToggle.addEventListener("click", () => {
            if (archiveDrawer && archiveDrawer.classList.contains("is-open")) closeArchiveDrawer(true);
            else openArchiveDrawer();
        });
    }
    if (archiveClose) archiveClose.addEventListener("click", () => closeArchiveDrawer(true));
    if (archiveDrawer) {
        archiveDrawer.addEventListener("click", (event) => {
            if (event.target === archiveDrawer) closeArchiveDrawer(true);
        });
        archiveDrawer.addEventListener("keydown", (event) => {
            if (event.key !== "Tab" || !archiveDrawer.classList.contains("is-open")) return;
            const focusables = drawerFocusables();
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        });
    }

    // ---------- Caption & Detail Panel Sync ----------

    function updateCaption(entry) {
        if (!entry) return;
        if (captionKicker) {
            captionKicker.innerHTML = `<span class="showcase-caption-dot" aria-hidden="true"></span>${entry.kicker} · ${formatDate(entry.project.date)}`;
        }
        if (captionTitle) {
            captionTitle.textContent = entry.project.title;
            captionTitle.lang = hasKorean(entry.project.title) ? "ko" : "";
        }
        if (captionSub) {
            captionSub.textContent = `${entry.subtitle} · ${platformLabel(entry.project)}`;
        }
        if (backdropKicker) {
            backdropKicker.textContent = `${W.appStats.total} APPS · ${W.appStats.span} · ${entry.kicker.toUpperCase()}`;
        }
    }

    function updateDots() {
        dotButtons.forEach((btn, idx) => {
            btn.classList.toggle("is-active", idx === activeCarousel);
            btn.setAttribute("aria-pressed", idx === activeCarousel ? "true" : "false");
        });
    }

    function populateDetailPanel(entry) {
        const p = entry.project;
        if (inspectKicker) inspectKicker.textContent = entry.kicker;
        if (inspectCatalogNo) inspectCatalogNo.textContent = `Catalog ${entry.catalogNo}`;
        if (inspectIcon) {
            inspectIcon.src = p.icon;
            inspectIcon.alt = p.title;
        }
        if (inspectTitle) {
            inspectTitle.textContent = p.title;
            inspectTitle.lang = hasKorean(p.title) ? "ko" : "";
        }
        if (inspectLead) inspectLead.textContent = entry.summary;

        if (inspectNotes) {
            inspectNotes.textContent = "";
            entry.notes.forEach((note, idx) => {
                const li = document.createElement("li");
                li.className = "inspect-note";
                const num = document.createElement("span");
                num.className = "inspect-note-num";
                num.textContent = String(idx + 1).padStart(2, "0");
                const wrap = document.createElement("div");
                const strong = document.createElement("strong");
                strong.textContent = note.title;
                const para = document.createElement("p");
                para.textContent = note.text;
                wrap.append(strong, para);
                li.append(num, wrap);
                inspectNotes.appendChild(li);
            });
        }

        if (inspectTags) {
            inspectTags.textContent = "";
            entry.tags.forEach((tag) => {
                const span = document.createElement("span");
                span.className = "inspect-tag";
                span.textContent = tag;
                inspectTags.appendChild(span);
            });
        }

        if (inspectStatus) {
            inspectStatus.innerHTML = `<span class="inspect-status-dot" aria-hidden="true"></span>Live · ${platformLabel(p)}`;
        }
        if (inspectDate) {
            inspectDate.textContent = formatDate(p.date);
        }

        if (inspectPrimary) {
            const primaryUrl = p.detail || p.ios || p.android || "#apps";
            inspectPrimary.href = primaryUrl;
            if (p.detail) {
                inspectPrimary.textContent = "Open App Page →";
                inspectPrimary.removeAttribute("target");
                inspectPrimary.removeAttribute("rel");
            } else {
                inspectPrimary.textContent = "Open Store →";
                inspectPrimary.target = "_blank";
                inspectPrimary.rel = "noopener";
            }
        }

        if (inspectIos) {
            if (p.ios) {
                inspectIos.href = p.ios;
                inspectIos.hidden = false;
            } else {
                inspectIos.hidden = true;
            }
        }

        if (inspectAndroid) {
            if (p.android) {
                inspectAndroid.href = p.android;
                inspectAndroid.hidden = false;
            } else {
                inspectAndroid.hidden = true;
            }
        }
    }

    let sceneController = null;
    const showcaseFooter = heroEl.querySelector(".showcase-footer");
    let inspectReturnFocus = null;

    if (inspectPanel) inspectPanel.inert = true;

    function setHeroChromeInert(isInspecting) {
        [showcaseFooter, a11yTriggers, fallbackWrap].forEach((el) => {
            if (!el) return;
            el.inert = isInspecting;
            if (isInspecting) el.setAttribute("aria-hidden", "true");
            else el.removeAttribute("aria-hidden");
        });
        if (inspectPanel) {
            inspectPanel.inert = !isInspecting;
            inspectPanel.setAttribute("aria-hidden", isInspecting ? "false" : "true");
        }
    }

    function setCarouselIndex(nextIdx) {
        const n = flagshipEntries.length;
        activeCarousel = ((nextIdx % n) + n) % n;
        updateDots();
        updateCaption(flagshipEntries[activeCarousel]);
        renderFallbackTriptych();
        if (sceneController) sceneController.onCarouselChange(activeCarousel);
    }

    function openInspection(entry, moveFocus = true) {
        if (!entry) return;
        const wasInspecting = Boolean(inspectedEntry);
        if (!wasInspecting) {
            inspectReturnFocus = document.activeElement instanceof HTMLElement && heroEl.contains(document.activeElement)
                ? document.activeElement
                : inspectCta;
        }
        inspectedEntry = entry;
        inspectedIndexInAll = entry.catalogIndex;
        const flagIdx = flagshipEntries.findIndex((f) => f.project.name === entry.project.name);
        if (flagIdx >= 0) {
            activeCarousel = flagIdx;
            updateDots();
            renderFallbackTriptych();
        }
        populateDetailPanel(entry);
        heroEl.classList.add("is-inspecting");
        document.body.classList.add("is-inspecting");
        setHeroChromeInert(true);
        if (sceneController) sceneController.onInspect(entry, flagIdx);
        if (moveFocus && !wasInspecting && closeBtn) {
            void heroEl.offsetHeight;
            closeBtn.focus();
        }
        // Smoothly return to top of hero if user invoked from slightly scrolled position
        if (window.scrollY > 40) {
            window.scrollTo({ top: 0, behavior: motionQuery.matches ? "auto" : "smooth" });
        }
    }

    function closeInspection() {
        if (!inspectedEntry) return;
        inspectedEntry = null;
        heroEl.classList.remove("is-inspecting");
        document.body.classList.remove("is-inspecting");
        setHeroChromeInert(false);
        updateCaption(flagshipEntries[activeCarousel]);
        if (sceneController) sceneController.onCloseInspect();
        if (inspectReturnFocus && typeof inspectReturnFocus.focus === "function") {
            void heroEl.offsetHeight;
            inspectReturnFocus.focus();
        }
        inspectReturnFocus = null;
    }

    function stepInspection(delta) {
        if (!inspectedEntry) return;
        const flagIdx = flagshipEntries.findIndex((f) => f.project.name === inspectedEntry.project.name);
        if (flagIdx >= 0) {
            const nextFlag = ((flagIdx + delta) % flagshipEntries.length + flagshipEntries.length) % flagshipEntries.length;
            openInspection(flagshipEntries[nextFlag]);
        } else {
            const nextAll = ((inspectedIndexInAll + delta) % allEntries.length + allEntries.length) % allEntries.length;
            openInspection(allEntries[nextAll]);
        }
    }

    // Wire UI buttons
    if (prevBtn) prevBtn.addEventListener("click", () => setCarouselIndex(activeCarousel - 1));
    if (nextBtn) nextBtn.addEventListener("click", () => setCarouselIndex(activeCarousel + 1));
    if (inspectCta) inspectCta.addEventListener("click", () => openInspection(flagshipEntries[activeCarousel]));
    if (closeBtn) closeBtn.addEventListener("click", closeInspection);
    if (inspectPrev) inspectPrev.addEventListener("click", () => stepInspection(-1));
    if (inspectNext) inspectNext.addEventListener("click", () => stepInspection(1));

    // Keyboard navigation
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            if (archiveDrawer && archiveDrawer.classList.contains("is-open")) {
                closeArchiveDrawer();
                return;
            }
            if (inspectedEntry) {
                closeInspection();
                return;
            }
        }
        if (window.scrollY > heroEl.offsetHeight * 0.6) return;
        if (archiveDrawer && archiveDrawer.classList.contains("is-open")) return;
        if (event.key === "ArrowLeft") {
            if (inspectedEntry) stepInspection(-1);
            else setCarouselIndex(activeCarousel - 1);
        } else if (event.key === "ArrowRight") {
            if (inspectedEntry) stepInspection(1);
            else setCarouselIndex(activeCarousel + 1);
        }
    });

    updateDots();
    updateCaption(flagshipEntries[activeCarousel]);

    // ---------- WebGL 3D Monograph Scene ----------
    if (!canvas || !webgl2Available()) {
        document.documentElement.classList.add("no-webgl");
        window.__wonHero = {
            webgl: false,
            selectEdition: (i) => openInspection(flagshipEntries[i]),
            close: closeInspection,
            get inspected() { return inspectedEntry ? inspectedEntry.project.name : null; },
        };
        return;
    }

    let renderer;
    try {
        renderer = new WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
    } catch {
        document.documentElement.classList.add("no-webgl");
        return;
    }

    const lowPower = !finePointerQuery.matches || Math.min(window.screen.width, window.screen.height) < 700;
    const BG = 0x080808;
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;

    const scene = new Scene();
    scene.background = null;
    scene.fog = new Fog(BG, 13, 26);

    const camera = new PerspectiveCamera(34, 1, 0.1, 60);
    const envRotation = new Euler();
    const envMap = buildStudioEnvironment(renderer, lowPower ? 256 : 512);
    const texLoader = new TextureLoader();
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const disposableTextures = [envMap];
    const disposableGeometries = [];
    const disposableMaterials = [];

    // Shared geometries for Monographs
    const BOOK_W = 2.18;
    const BOOK_H = 3.08;
    const BOOK_D = 0.24;
    const COVER_T = 0.036;

    const emptyGeo = new BufferGeometry();
    const boardGeo = new BoxGeometry(BOOK_W, BOOK_H, COVER_T);
    const faceGeo = new PlaneGeometry(BOOK_W - 0.012, BOOK_H - 0.012);
    const spineGeo = new BoxGeometry(0.056, BOOK_H + 0.004, BOOK_D + 0.004);
    const blockGeo = new BoxGeometry(BOOK_W - 0.09, BOOK_H - 0.09, BOOK_D - COVER_T * 2 - 0.008);
    const leafGeo = new PlaneGeometry(BOOK_W - 0.11, BOOK_H - 0.11);

    disposableGeometries.push(emptyGeo, boardGeo, faceGeo, spineGeo, blockGeo, leafGeo);

    // Shared page-edge & metal materials
    const pageEdgeTex = texLoader.load(drawPageEdgeTexture(), () => requestRender());
    pageEdgeTex.colorSpace = SRGBColorSpace;
    pageEdgeTex.minFilter = LinearMipmapLinearFilter;
    pageEdgeTex.magFilter = LinearFilter;
    pageEdgeTex.anisotropy = maxAniso;
    disposableTextures.push(pageEdgeTex);

    const pageBlockMat = new MeshPhysicalMaterial({
        color: 0xd0d0d8,
        map: pageEdgeTex,
        roughness: 0.72,
        metalness: 0.06,
        envMap,
        envMapIntensity: 0.55,
    });
    pageBlockMat.envMapRotation = envRotation;

    const boardEdgeMat = new MeshPhysicalMaterial({
        color: 0x16161b,
        metalness: 0.62,
        roughness: 0.34,
        envMap,
        envMapIntensity: 0.9,
    });
    boardEdgeMat.envMapRotation = envRotation;

    const leafMat = new MeshPhysicalMaterial({
        color: 0xd4d4dc,
        roughness: 0.76,
        metalness: 0.04,
        envMap,
        envMapIntensity: 0.45,
        side: 2, // DoubleSide
    });
    leafMat.envMapRotation = envRotation;

    disposableMaterials.push(pageBlockMat, boardEdgeMat, leafMat);

    // Build a 3D Monograph Volume object
    function createMonograph(entry, idIndex) {
        const root = new Mesh(emptyGeo);
        scene.add(root);

        // Back cover board
        const backBoard = new Mesh(boardGeo, boardEdgeMat);
        backBoard.position.set(0, 0, -BOOK_D / 2 + COVER_T / 2);
        root.add(backBoard);

        // Inner bound page block
        const block = new Mesh(blockGeo, pageBlockMat);
        block.position.set(0.015, 0, -0.004);
        root.add(block);

        // Spine with custom metallic printed canvas texture
        const spineMat = new MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.32,
            roughness: 0.36,
            clearcoat: 0.4,
            clearcoatRoughness: 0.2,
            envMap,
            envMapIntensity: 0.85,
        });
        spineMat.envMapRotation = envRotation;
        disposableMaterials.push(spineMat);

        const spineMesh = new Mesh(spineGeo, spineMat);
        spineMesh.position.set(-BOOK_W / 2 + 0.028, 0, 0);
        root.add(spineMesh);

        // 5 hinged inner folio leaves that fan out in inspection mode
        const leafPivots = [];
        const LEAF_COUNT = 5;
        for (let i = 0; i < LEAF_COUNT; i += 1) {
            const pivot = new Mesh(emptyGeo);
            pivot.position.set(-BOOK_W / 2 + 0.042, 0, -0.04 + (i / (LEAF_COUNT - 1)) * 0.095);
            const leaf = new Mesh(leafGeo, leafMat);
            leaf.position.set((BOOK_W - 0.11) / 2, 0, 0);
            pivot.add(leaf);
            root.add(pivot);
            leafPivots.push(pivot);
        }

        // Hinged front hardcover plate
        const coverPivot = new Mesh(emptyGeo);
        coverPivot.position.set(-BOOK_W / 2 + 0.032, 0, BOOK_D / 2 - COVER_T / 2);
        root.add(coverPivot);

        const frontBoard = new Mesh(boardGeo, boardEdgeMat);
        frontBoard.position.set(BOOK_W / 2 - 0.032, 0, 0);
        coverPivot.add(frontBoard);

        const coverFaceMat = new MeshPhysicalMaterial({
            color: 0x050507,
            emissive: 0xffffff,
            emissiveIntensity: 0.98,
            roughness: 0.42,
            metalness: 0.06,
            clearcoat: 0.38,
            clearcoatRoughness: 0.26,
            envMap,
            envMapIntensity: 0.24,
        });
        coverFaceMat.envMapRotation = envRotation;
        disposableMaterials.push(coverFaceMat);

        const coverFace = new Mesh(faceGeo, coverFaceMat);
        coverFace.position.set(BOOK_W / 2 - 0.032, 0, COVER_T / 2 + 0.002);
        coverFace.userData.monographIndex = idIndex;
        coverPivot.add(coverFace);

        // Make back & block also raycast-clickable
        frontBoard.userData.monographIndex = idIndex;
        backBoard.userData.monographIndex = idIndex;
        spineMesh.userData.monographIndex = idIndex;

        const monograph = {
            idIndex,
            entry,
            root,
            coverPivot,
            coverFace,
            coverFaceMat,
            spineMat,
            leafPivots,
            hitTargets: [coverFace, frontBoard, spineMesh, backBoard],
            coverTex: null,
            spineTex: null,
            pos: new Vector3(0, -1.2, -2),
            targetPos: new Vector3(),
            rot: new Vector3(),
            targetRot: new Vector3(),
            scale: 0.9,
            targetScale: 1,
            open: 0,
            targetOpen: 0,
            hover: 0,
            light: 0.92,
            targetLight: 0.92,
            visible: true,
        };

        applyMonographArtwork(monograph, entry);
        return monograph;
    }

    function applyMonographArtwork(monograph, entry) {
        monograph.entry = entry;

        const renderCover = (img) => {
            const url = drawCoverCanvas(entry, img);
            texLoader.load(url, (tex) => {
                tex.colorSpace = SRGBColorSpace;
                tex.anisotropy = maxAniso;
                if (monograph.coverTex) monograph.coverTex.dispose();
                monograph.coverTex = tex;
                disposableTextures.push(tex);
                monograph.coverFaceMat.emissiveMap = tex;
                monograph.coverFaceMat.needsUpdate = true;
                requestRender();
            });
        };

        // Initial fast cover + high-res redraw when icon finishes loading
        const img = new Image();
        img.decoding = "async";
        img.onload = () => renderCover(img);
        img.onerror = () => renderCover(null);
        img.src = entry.project.icon;
        if (img.complete && img.naturalWidth > 0) renderCover(img);
        else renderCover(null);

        texLoader.load(drawSpineTexture(entry), (tex) => {
            tex.colorSpace = SRGBColorSpace;
            tex.anisotropy = maxAniso;
            if (monograph.spineTex) monograph.spineTex.dispose();
            monograph.spineTex = tex;
            disposableTextures.push(tex);
            monograph.spineMat.map = tex;
            monograph.spineMat.needsUpdate = true;
            requestRender();
        });
    }

    // Create the 6 flagship monographs + 1 on-demand archive monograph for the remaining 37 apps
    const monographs = flagshipEntries.map((entry, idx) => createMonograph(entry, idx));
    const customMonograph = createMonograph(flagshipEntries[0], -1);
    customMonograph.root.visible = false;
    customMonograph.visible = false;

    // Re-render covers cleanly once Cormorant Garamond & Jost fonts finish loading
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            monographs.forEach((m) => applyMonographArtwork(m, m.entry));
            if (customMonograph.visible) applyMonographArtwork(customMonograph, customMonograph.entry);
        });
    }

    // ---------- View, Layout & Interaction State ----------
    const view = { w: 1, h: 1, portrait: false, dpr: 1 };
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false };
    const raycaster = new Raycaster();
    const ndc = new Vector2();

    let hoveredIdx = -1;
    let inspectedFlagIdx = -1;
    let inspectingCustom = false;
    let reduced = motionQuery.matches;
    let visibleInViewport = true;
    let running = false;
    let frameQueued = false;
    let frameCount = 0;
    let lastTime = performance.now();
    const startTime = performance.now();

    // Pointer drag state (carousel swipe in hero mode; 3D orbit in inspect mode)
    const drag = {
        active: false,
        moved: false,
        startX: 0,
        startY: 0,
        dx: 0,
        dy: 0,
        orbitYaw: 0,
        orbitPitch: 0,
        targetOrbitYaw: 0,
        targetOrbitPitch: 0,
        carouselPull: 0,
    };

    function resize() {
        const w = canvas.clientWidth || heroEl.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || heroEl.clientHeight || window.innerHeight;
        view.w = Math.max(1, w);
        view.h = Math.max(1, h);
        view.portrait = view.w < 768 || view.w / view.h < 0.85;
        const maxDpr = lowPower ? 1.5 : 2;
        view.dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        renderer.setPixelRatio(view.dpr);
        renderer.setSize(view.w, view.h, false);
        camera.aspect = view.w / view.h;
        camera.fov = view.portrait ? 38 : 34;
        camera.updateProjectionMatrix();
        requestRender();
    }

    function shortestOffset(idx, center, n) {
        let d = idx - center;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        return d;
    }

    function pickMonograph(clientX, clientY) {
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return -1;
        ndc.set((x / rect.width) * 2 - 1, -(y / rect.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const targets = [];
        monographs.forEach((m) => {
            if (m.root.visible) targets.push(...m.hitTargets);
        });
        const hit = raycaster.intersectObjects(targets, false)[0];
        if (!hit) return -1;
        return hit.object.userData.monographIndex ?? -1;
    }

    // Pointer Events
    canvas.addEventListener("pointermove", (event) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
        pointer.nx = (pointer.x / Math.max(1, rect.width)) * 2 - 1;
        pointer.ny = -(pointer.y / Math.max(1, rect.height)) * 2 + 1;

        if (drag.active) {
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            drag.dx = dx;
            drag.dy = dy;
            if (Math.hypot(dx, dy) > 7) drag.moved = true;

            if (inspectedEntry) {
                drag.targetOrbitYaw = clamp(dx * 0.0052, -0.68, 0.72);
                drag.targetOrbitPitch = clamp(dy * 0.0032, -0.28, 0.3);
            } else {
                drag.carouselPull = clamp(dx / Math.max(240, view.w * 0.35), -0.9, 0.9);
            }
            requestRender();
            return;
        }

        if (!inspectedEntry && event.pointerType === "mouse") {
            const hit = pickMonograph(event.clientX, event.clientY);
            if (hit !== hoveredIdx) {
                hoveredIdx = hit;
                canvas.classList.toggle("is-pointer", hoveredIdx >= 0);
                if (hoveredIdx >= 0 && monographs[hoveredIdx]) {
                    updateCaption(monographs[hoveredIdx].entry);
                } else {
                    updateCaption(flagshipEntries[activeCarousel]);
                }
                requestRender();
            }
        }
        if (reduced) requestRender();
    });

    canvas.addEventListener("pointerdown", (event) => {
        if (event.button !== 0 && event.pointerType === "mouse") return;
        drag.active = true;
        drag.moved = false;
        drag.startX = event.clientX;
        drag.startY = event.clientY;
        drag.dx = 0;
        drag.dy = 0;
        canvas.classList.add("is-dragging");
        if (canvas.setPointerCapture) {
            try { canvas.setPointerCapture(event.pointerId); } catch {}
        }
    });

    function finishDrag(event) {
        if (!drag.active) return;
        drag.active = false;
        canvas.classList.remove("is-dragging");

        if (drag.moved) {
            if (!inspectedEntry) {
                if (drag.dx < -55) setCarouselIndex(activeCarousel + 1);
                else if (drag.dx > 55) setCarouselIndex(activeCarousel - 1);
            } else {
                // Softly settle back toward canonical 3/4 display angle
                drag.targetOrbitYaw *= 0.25;
                drag.targetOrbitPitch *= 0.2;
            }
            drag.carouselPull = 0;
            requestRender();
            return;
        }

        drag.carouselPull = 0;
        // Treat as a clean click/tap
        if (inspectedEntry) {
            // Clicking empty stage left of panel closes detail view
            const hit = pickMonograph(event.clientX, event.clientY);
            if (hit < 0 && !inspectingCustom) {
                closeInspection();
            }
            return;
        }

        const hit = pickMonograph(event.clientX, event.clientY);
        if (hit >= 0 && monographs[hit]) {
            openInspection(monographs[hit].entry);
        }
    }

    canvas.addEventListener("pointerup", finishDrag);
    canvas.addEventListener("pointercancel", finishDrag);
    canvas.addEventListener("pointerleave", () => {
        pointer.inside = false;
        if (!drag.active && hoveredIdx !== -1) {
            hoveredIdx = -1;
            canvas.classList.remove("is-pointer");
            if (!inspectedEntry) updateCaption(flagshipEntries[activeCarousel]);
            requestRender();
        }
    });

    // Horizontal wheel / trackpad swipe to cycle editions
    let wheelCooldown = 0;
    heroEl.addEventListener("wheel", (event) => {
        if (inspectedEntry || (archiveDrawer && archiveDrawer.classList.contains("is-open"))) return;
        if (Math.abs(event.deltaX) > Math.abs(event.deltaY) && Math.abs(event.deltaX) > 26) {
            const now = performance.now();
            if (now - wheelCooldown < 420) return;
            wheelCooldown = now;
            setCarouselIndex(activeCarousel + (event.deltaX > 0 ? 1 : -1));
        }
    }, { passive: true });

    sceneController = {
        onCarouselChange() {
            requestRender();
        },
        onInspect(entry, flagIdx) {
            hoveredIdx = -1;
            canvas.classList.remove("is-pointer");
            drag.targetOrbitYaw = 0;
            drag.targetOrbitPitch = 0;
            if (flagIdx >= 0) {
                inspectedFlagIdx = flagIdx;
                inspectingCustom = false;
                customMonograph.visible = false;
            } else {
                inspectedFlagIdx = -1;
                inspectingCustom = true;
                applyMonographArtwork(customMonograph, entry);
                customMonograph.pos.set(view.portrait ? 0 : -1.8, -3.5, 0.5);
                customMonograph.rot.set(0.1, -0.5, 0);
                customMonograph.open = 0;
                customMonograph.visible = true;
                customMonograph.root.visible = true;
            }
            requestRender();
        },
        onCloseInspect() {
            inspectedFlagIdx = -1;
            inspectingCustom = false;
            drag.targetOrbitYaw = 0;
            drag.targetOrbitPitch = 0;
            requestRender();
        },
    };

    // ---------- Per-Frame Animation Loop ----------
    const camPos = new Vector3(0, 0.1, 8.8);
    const camTarget = new Vector3(0, -0.1, 0);
    const camDesiredPos = new Vector3();
    const camDesiredTarget = new Vector3();

    function computeTargets(time) {
        const portrait = view.portrait;
        const aspect = view.w / Math.max(1, view.h);
        const inspecting = Boolean(inspectedEntry);

        // Camera framing
        if (inspecting) {
            camDesiredPos.set(0, portrait ? 0.15 : 0.08, portrait ? 10.6 : 8.5);
            camDesiredTarget.set(0, portrait ? -0.15 : -0.04, 0);
        } else {
            const parallaxX = !reduced && pointer.inside ? pointer.nx * 0.24 : 0;
            const parallaxY = !reduced && pointer.inside ? pointer.ny * 0.12 : 0;
            camDesiredPos.set(parallaxX, (portrait ? 0.08 : 0.12) + parallaxY, portrait ? 10.4 : 8.6);
            camDesiredTarget.set(parallaxX * 0.18, portrait ? -0.22 : -0.16, 0);
        }

        const n = monographs.length;
        const inspectX = portrait ? 0 : -clamp(aspect * 1.02, 1.28, 1.92);
        const inspectY = portrait ? 1.42 : -0.02;
        const inspectZ = portrait ? 0.55 : 0.96;
        const inspectScale = portrait ? 0.7 : clamp(aspect * 0.68, 0.84, 1.02);

        monographs.forEach((m, idx) => {
            const offset = shortestOffset(idx, activeCarousel, n);
            const isSelected = inspecting && !inspectingCustom && idx === inspectedFlagIdx;

            if (inspecting) {
                if (isSelected) {
                    m.visible = true;
                    const floatY = reduced ? 0 : Math.sin(time * 0.9) * 0.045;
                    m.targetPos.set(inspectX, inspectY + floatY, inspectZ);
                    m.targetRot.set(
                        0.04 + drag.orbitPitch,
                        -0.28 + drag.orbitYaw + (reduced ? 0 : Math.sin(time * 0.45) * 0.025),
                        0.015
                    );
                    m.targetScale = inspectScale;
                    m.targetOpen = 1;
                    m.targetLight = 1.0;
                } else {
                    // Gracefully glide non-selected editions out of frame
                    const side = offset < 0 ? -1 : 1;
                    m.visible = true;
                    m.targetPos.set(side * (portrait ? 5.8 : 7.8), -2.2, -3.2);
                    m.targetRot.set(0.08, side * -0.5, side * -0.18);
                    m.targetScale = 0.72;
                    m.targetOpen = 0;
                    m.targetLight = 0.12;
                }
                return;
            }

            // Hero Triptych Mode: slots -1, 0, +1 visible; others parked off-stage
            const shifted = offset + drag.carouselPull;
            const isHovered = idx === hoveredIdx;
            const anyHover = hoveredIdx >= 0;
            const bob = reduced ? 0 : Math.sin(time * 0.75 + idx * 1.35) * 0.035;

            if (Math.abs(offset) <= 1) {
                m.visible = true;
                const spreadX = portrait ? 1.72 : clamp(aspect * 1.28, 1.88, 2.24);
                const x = shifted * spreadX;
                const absS = Math.abs(shifted);
                const baseY = (portrait ? -0.44 : -0.66) - absS * (portrait ? 0.16 : 0.22);
                const baseZ = 0.36 - absS * 0.82;
                const hoverLiftY = isHovered ? 0.22 : 0;
                const hoverPushZ = isHovered ? 0.4 : anyHover ? -0.14 : 0;

                m.targetPos.set(x, baseY + bob + hoverLiftY, baseZ + hoverPushZ);
                m.targetRot.set(
                    0.02 + (isHovered ? pointer.ny * -0.05 : 0),
                    shifted * -0.22 + (isHovered ? pointer.nx * 0.09 : 0),
                    shifted * -0.11 * (isHovered ? 0.45 : 1)
                );
                m.targetScale = (portrait ? 0.94 : 1.08) - absS * 0.08 + (isHovered ? 0.045 : 0);
                m.targetOpen = isHovered ? 0.18 : 0;
                m.targetLight = isHovered ? 1.04 : anyHover ? 0.74 : 0.98 - absS * 0.08;
            } else {
                const side = offset < 0 ? -1 : 1;
                m.visible = false;
                m.targetPos.set(side * (portrait ? 4.8 : 6.8), -1.45, -2.5);
                m.targetRot.set(0.06, side * -0.45, side * -0.18);
                m.targetScale = 0.76;
                m.targetOpen = 0;
                m.targetLight = 0.18;
            }
        });

        // On-demand Archive Monograph (for any of the other 37 apps)
        if (inspecting && inspectingCustom) {
            customMonograph.visible = true;
            const floatY = reduced ? 0 : Math.sin(time * 0.9) * 0.045;
            customMonograph.targetPos.set(inspectX, inspectY + floatY, inspectZ);
            customMonograph.targetRot.set(
                0.04 + drag.orbitPitch,
                -0.28 + drag.orbitYaw + (reduced ? 0 : Math.sin(time * 0.45) * 0.025),
                0.015
            );
            customMonograph.targetScale = inspectScale;
            customMonograph.targetOpen = 1;
            customMonograph.targetLight = 1.0;
        } else {
            customMonograph.visible = false;
            customMonograph.targetPos.set(inspectX, -4.2, -2.4);
            customMonograph.targetOpen = 0;
            customMonograph.targetLight = 0;
        }
    }

    function applyMonographPose(m, easePos, easeRot, easeOpen) {
        if (reduced) {
            m.pos.copy(m.targetPos);
            m.rot.copy(m.targetRot);
            m.scale = m.targetScale;
            m.open = m.targetOpen;
            m.light = m.targetLight;
        } else {
            m.pos.lerp(m.targetPos, easePos);
            m.rot.lerp(m.targetRot, easeRot);
            m.scale = lerp(m.scale, m.targetScale, easePos);
            m.open = lerp(m.open, m.targetOpen, easeOpen);
            m.light = lerp(m.light, m.targetLight, easeRot);
        }

        const isOffstage = !m.visible && Math.abs(m.pos.x) > 4.2 && m.light < 0.25;
        m.root.visible = !isOffstage && !(m === customMonograph && !m.visible && m.pos.y < -3.8);
        if (!m.root.visible) return;

        m.root.position.copy(m.pos);
        m.root.rotation.set(m.rot.x, m.rot.y, m.rot.z);
        m.root.scale.setScalar(Math.max(0.01, m.scale));

        // Hinged cover & fanned archival folio leaves
        const openAngle = m.open * 0.28;
        m.coverPivot.rotation.y = -openAngle;
        m.leafPivots.forEach((pivot, i) => {
            const frac = (i + 1) / (m.leafPivots.length + 1);
            pivot.rotation.y = -openAngle * frac * 0.88;
        });

        m.coverFaceMat.emissiveIntensity = m.light;
    }

    function step(now) {
        const dt = clamp((now - lastTime) / 1000, 0.001, 0.05);
        lastTime = now;
        const time = (now - startTime) / 1000;

        // Smooth drag orbit damping
        const orbitEase = reduced ? 1 : 1 - Math.exp(-dt * 8);
        drag.orbitYaw = lerp(drag.orbitYaw, drag.targetOrbitYaw, orbitEase);
        drag.orbitPitch = lerp(drag.orbitPitch, drag.targetOrbitPitch, orbitEase);

        computeTargets(time);

        const easeCam = reduced ? 1 : 1 - Math.exp(-dt * 4.8);
        const easePos = reduced ? 1 : 1 - Math.exp(-dt * 6.5);
        const easeRot = reduced ? 1 : 1 - Math.exp(-dt * 7.2);
        const easeOpen = reduced ? 1 : 1 - Math.exp(-dt * 5.2);

        camPos.lerp(camDesiredPos, easeCam);
        camTarget.lerp(camDesiredTarget, easeCam);
        camera.position.copy(camPos);
        camera.lookAt(camTarget);

        // Live specular light sweep synchronized to pointer & inspection orbit
        const envTargetY = (inspectedEntry ? -0.35 + drag.orbitYaw * 0.65 : pointer.nx * 0.32)
            + (reduced ? 0 : Math.sin(time * 0.25) * 0.14);
        envRotation.y = lerp(envRotation.y, envTargetY, easeCam);

        monographs.forEach((m) => applyMonographPose(m, easePos, easeRot, easeOpen));
        applyMonographPose(customMonograph, easePos, easeRot, easeOpen);

        renderer.render(scene, camera);
        frameCount += 1;
    }

    function loop(now) {
        if (!running) return;
        step(now);
        requestAnimationFrame(loop);
    }

    function startLoop() {
        if (running || reduced || !visibleInViewport || document.hidden) return;
        running = true;
        lastTime = performance.now();
        requestAnimationFrame(loop);
    }

    function stopLoop() {
        running = false;
    }

    function requestRender() {
        if (running || frameQueued) return;
        frameQueued = true;
        requestAnimationFrame((now) => {
            frameQueued = false;
            if (!running) step(now);
        });
    }

    // Initial instant placement (no awkward fly-in jump)
    resize();
    {
        const wasReduced = reduced;
        reduced = true;
        step(performance.now());
        reduced = wasReduced;
    }

    // Pause rendering when hero scrolls out of viewport or tab hides
    const io = new IntersectionObserver((entries) => {
        visibleInViewport = entries[0].isIntersecting;
        if (visibleInViewport) {
            startLoop();
            requestRender();
        } else {
            stopLoop();
        }
    }, { threshold: 0.02 });
    io.observe(heroEl);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopLoop();
        else startLoop();
    });

    let resizeTimer = 0;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 100);
    });

    const onMotionChange = () => {
        reduced = motionQuery.matches;
        if (reduced) stopLoop();
        else startLoop();
        requestRender();
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);

    // Clean WebGL resource disposal on genuine unload (preserve bfcache restores)
    let disposed = false;
    function dispose() {
        if (disposed) return;
        disposed = true;
        stopLoop();
        io.disconnect();
        disposableGeometries.forEach((g) => g.dispose());
        disposableMaterials.forEach((m) => m.dispose());
        disposableTextures.forEach((t) => t.dispose());
        renderer.dispose();
    }
    window.addEventListener("pagehide", (event) => {
        if (event.persisted) {
            stopLoop();
            return;
        }
        dispose();
    });
    window.addEventListener("pageshow", (event) => {
        if (!event.persisted || disposed) return;
        resize();
        if (visibleInViewport && !document.hidden) startLoop();
        requestRender();
    });

    // Expose clean test/debug hook
    window.__wonHero = {
        webgl: true,
        flagshipCount: flagshipEntries.length,
        totalApps: allEntries.length,
        selectEdition: (idx) => {
            const entry = flagshipEntries[idx];
            if (entry) openInspection(entry);
        },
        selectAppByName: (name) => {
            const entry = allEntries.find((e) => e.project.name === name);
            if (entry) openInspection(entry);
        },
        cycle: (delta) => setCarouselIndex(activeCarousel + delta),
        close: closeInspection,
        openArchive: openArchiveDrawer,
        closeArchive: closeArchiveDrawer,
        dispose,
        get activeCarousel() { return activeCarousel; },
        get inspected() { return inspectedEntry ? inspectedEntry.project.name : null; },
        get frames() { return frameCount; },
        get running() { return running; },
    };

    startLoop();
    requestRender();
}

try {
    initShowcase();
} catch (error) {
    console.warn("Hero 3D showcase fallback:", error);
    document.documentElement.classList.add("no-webgl");
}
