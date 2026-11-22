// won-space.com 첫 화면 WebGL 장면.
// 위에서 아래로 내리면 이야기 순서대로 바뀐다.
//   첫 화면: 최신 앱이 빛 속에 서 있다.
//   출시 달력: 첫 앱부터 낸 날짜 순서대로 아이콘이 어둠에서 나와 달마다 막대로 쌓인다(빨간 가는 선이 지금 달).
//   숫자: 아이콘이 모여 앱 수("43")가 된다. → 벽: 모두 한 벽에 걸린다. → 끝: 비어 있는 다음 자리 하나가 앞으로 나온다.
// 무대(바닥 · 빛 · 반사)는 portfolio/stage.js의 두 판 중 하나(?bg=1|2). 움직임은 모두 느리고 묵직하게(튀는 탄성 없음).
// three.js 0.186.1을 portfolio/lib에 고정해 쓴다(빌드 없이 ES module로 열린다).
import {
    Color,
    EffectComposer,
    Euler,
    ExtrudeGeometry,
    Mesh,
    MeshPhysicalMaterial,
    NeutralToneMapping,
    OutputPass,
    PerspectiveCamera,
    Raycaster,
    RenderPass,
    Scene,
    Shape,
    SMAAPass,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "./lib/three-0.186.1.min.js?v=20261122e";
import { createStage, DepthOfFieldPass, GrainPass } from "./stage.js?v=20261122e";

const W = window.WON;
const docEl = document.documentElement;
const canvas = document.getElementById("scene");
const stage = document.getElementById("stage");
const label = document.getElementById("tileLabel");
const hero = document.getElementById("hero");
const numbers = document.getElementById("numbers");
const wall = document.getElementById("wall");
const nextSection = document.getElementById("next");
const timelineEl = document.getElementById("timeline");
const chapters = ["chFirst", "chYear", "chPause", "chGames"].map((id) => document.getElementById(id));
const mailLink = document.querySelector(".contact-mail");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const BLACK = 0x080808;
const FOV = 30;
// 기본 무대. 대표가 고르면 이 값만 남기고 다른 판은 지운다.
const STAGE_DEFAULT = "1";
const stageParam = new URLSearchParams(window.location.search).get("bg");
const STAGE_KIND = ["1", "2"].includes(stageParam) ? stageParam : STAGE_DEFAULT;
const RIGHT = new Vector3(1, 0, 0);
// 출시 달력에서 아직 차례가 오지 않은 아이콘이 기다리는 깊이(제자리 뒤쪽, 안개 속).
const WAIT_DEPTH = 26;

// 7×9 칸 숫자 글꼴. 획 굵기 한 칸. "4"는 20칸, "3"은 23칸이라 "43"이 타일 43개와 꼭 맞는다.
const GLYPHS = {
    "0": [".#####.", "#.....#", "#....##", "#...#.#", "#..#..#", "#.#...#", "##....#", "#.....#", ".#####."],
    "1": ["...#...", "..##...", ".#.#...", "...#...", "...#...", "...#...", "...#...", "...#...", ".#####."],
    "2": [".#####.", "#.....#", "......#", ".....#.", "...##..", "..#....", ".#.....", "#......", "#######"],
    "3": ["######.", "......#", "......#", "......#", ".#####.", "......#", "......#", "......#", "######."],
    "4": [".....#.", "....##.", "...#.#.", "..#..#.", ".#...#.", "#....#.", "#######", ".....#.", ".....#."],
    "5": ["#######", "#......", "#......", "######.", "......#", "......#", "......#", "#.....#", ".#####."],
    "6": [".#####.", "#......", "#......", "######.", "#.....#", "#.....#", "#.....#", "#.....#", ".#####."],
    "7": ["#######", "......#", ".....#.", "....#..", "...#...", "...#...", "...#...", "...#...", "...#..."],
    "8": [".#####.", "#.....#", "#.....#", "#.....#", ".#####.", "#.....#", "#.....#", "#.....#", ".#####."],
    "9": [".#####.", "#.....#", "#.....#", "#.....#", ".######", "......#", "......#", "......#", ".#####."],
};

function fillNextNumber() {
    if (!W) return;
    document.querySelectorAll('[data-stat="next"]').forEach((el) => {
        el.textContent = String(W.appStats.total + 1);
    });
}

function showFallback() {
    docEl.classList.add("no-webgl");
    const box = document.getElementById("wallFallback");
    if (!box || !W || box.childElementCount) return;
    for (const project of W.projects) {
        const link = document.createElement("a");
        const url = W.getStoreUrl(project);
        link.href = url;
        if (url !== project.detail) {
            link.target = "_blank";
            link.rel = "noopener";
        }
        link.title = `${project.title} · ${project.date.replace(/-/g, ".")}`;
        const img = document.createElement("img");
        img.src = project.icon;
        img.alt = project.title;
        img.loading = "lazy";
        img.width = 96;
        img.height = 96;
        link.appendChild(img);
        box.appendChild(link);
    }
}

function mulberry32(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t) => 1 - Math.pow(1 - t, 3);

function webglAvailable() {
    try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl2"));
    } catch (error) {
        return false;
    }
}

function tileGeometry() {
    // 둥근 사각 타일(앞면 = 아이콘, 옆면 = 금속 두께). 바깥 크기 1 × 1. 모서리 깎음을 촘촘히 해 빛이 매끄럽게 흐르게 한다.
    const bevel = 0.045;
    const size = 1 - bevel * 2;
    const half = size / 2;
    const radius = size * 0.225;
    const shape = new Shape();
    shape.moveTo(-half + radius, -half);
    shape.lineTo(half - radius, -half);
    shape.quadraticCurveTo(half, -half, half, -half + radius);
    shape.lineTo(half, half - radius);
    shape.quadraticCurveTo(half, half, half - radius, half);
    shape.lineTo(-half + radius, half);
    shape.quadraticCurveTo(-half, half, -half, half - radius);
    shape.lineTo(-half, -half + radius);
    shape.quadraticCurveTo(-half, -half, -half + radius, -half);
    const uv = (vertices, index) => new Vector2((vertices[index * 3] + half) / size, (vertices[index * 3 + 1] + half) / size);
    const geometry = new ExtrudeGeometry(shape, {
        depth: 0.13,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: bevel,
        bevelSegments: 6,
        curveSegments: 12,
        UVGenerator: {
            generateTopUV(geo, vertices, a, b, c) {
                return [uv(vertices, a), uv(vertices, b), uv(vertices, c)];
            },
            generateSideWallUV() {
                return [new Vector2(0, 0), new Vector2(1, 0), new Vector2(1, 1), new Vector2(0, 1)];
            },
        },
    });
    geometry.translate(0, 0, -0.065);
    smoothSides(geometry);
    geometry.computeBoundingSphere();
    return geometry;
}

function smoothSides(geometry) {
    // ExtrudeGeometry는 삼각형마다 법선을 따로 둬서, 깎은 모서리 여섯 단이 각각 다른 띠로 빛난다(겹테 · 계단).
    // 옆면(깎음 포함)만 같은 자리의 법선을 평균해 빛이 모서리를 따라 한 줄로 흐르게 한다. 앞뒤 판은 평평하게 둔다.
    const pos = geometry.attributes.position;
    const nor = geometry.attributes.normal;
    const key = (i) => `${Math.round(pos.getX(i) * 1e5)},${Math.round(pos.getY(i) * 1e5)},${Math.round(pos.getZ(i) * 1e5)}`;
    const sums = new Map();
    const sides = geometry.groups.filter((g) => g.materialIndex === 1);
    sides.forEach((g) => {
        for (let i = g.start; i < g.start + g.count; i += 1) {
            const k = key(i);
            const v = sums.get(k) || [0, 0, 0];
            v[0] += nor.getX(i);
            v[1] += nor.getY(i);
            v[2] += nor.getZ(i);
            sums.set(k, v);
        }
    });
    sides.forEach((g) => {
        for (let i = g.start; i < g.start + g.count; i += 1) {
            const v = sums.get(key(i));
            const l = Math.hypot(v[0], v[1], v[2]) || 1;
            nor.setXYZ(i, v[0] / l, v[1] / l, v[2] / l);
        }
    });
    nor.needsUpdate = true;
}

function plusImage() {
    // 비어 있는 다음 자리의 앞면: 검은 판 가운데 가는 흰 「+」 하나(그림 주소로 돌려준다).
    const size = 256;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const g = c.getContext("2d");
    g.fillStyle = "#000000";
    g.fillRect(0, 0, size, size);
    g.fillStyle = "#FFFFFF";
    const len = 46;
    const thick = 3;
    g.fillRect(size / 2 - len / 2, size / 2 - thick / 2, len, thick);
    g.fillRect(size / 2 - thick / 2, size / 2 - len / 2, thick, len);
    return c.toDataURL("image/png");
}

function glyphCells(text) {
    // 글자마다 7×9 칸 → 칸 좌표 목록. 가로로 놓은 판과 세로로 쌓은 판 둘 다 만든다.
    const digits = [...text].filter((ch) => GLYPHS[ch]);
    const build = (stacked) => {
        const cells = [];
        digits.forEach((ch, d) => {
            const ox = stacked ? 0 : d * 9;
            const oy = stacked ? d * 10 : 0;
            GLYPHS[ch].forEach((row, r) => {
                [...row].forEach((mark, c) => {
                    if (mark === "#") cells.push({ c: ox + c, r: oy + r });
                });
            });
        });
        const cols = stacked ? 7 : digits.length * 9 - 2;
        const rows = stacked ? digits.length * 10 - 1 : 9;
        return { cells, cols, rows };
    };
    return { wide: build(false), tall: build(true) };
}

function buildCalendar(projects) {
    // 출시 날짜 → 달 번호(첫 앱이 나온 달 = 0), 그 달 안의 순서, 막대에 도착하는 때(달 단위 소수).
    const parse = (text) => text.split("-").map(Number);
    const [y0, m0] = parse(projects[0].date);
    const base = y0 * 12 + (m0 - 1);
    const counts = [];
    const items = projects.map((project) => {
        const [y, m, d] = parse(project.date);
        const month = y * 12 + (m - 1) - base;
        while (counts.length <= month) counts.push(0);
        const order = counts[month];
        counts[month] += 1;
        const days = new Date(y, m, 0).getDate();
        return { month, order, arrive: month + 0.72 * ((d - 1) / days) };
    });
    const months = counts.length;
    const lastYear = Math.floor((base + months - 1) / 12);
    const years = [];
    for (let y = y0; y <= lastYear; y += 1) years.push(y);
    const yearOf = (i) => Math.floor((base + i) / 12);
    const monthOf = (i) => (base + i) % 12;
    const yearMax = years.map((y) => Math.max(1, ...counts.filter((c, i) => yearOf(i) === y)));
    const name = (i) => `${yearOf(i)}.${String(monthOf(i) + 1).padStart(2, "0")}`;
    const monthIndex = (date) => {
        const [y, m] = parse(date);
        return y * 12 + (m - 1) - base;
    };
    // 이야기 마디: 첫해가 끝나는 달, 다음 해 첫 앱이 나온 달.
    const firstYearEnd = 12 - (m0 - 1);
    const resumeItem = items.find((item) => yearOf(item.month) > y0);
    const resume = resumeItem ? resumeItem.month : firstYearEnd;
    return { items, counts, months, years, yearMax, yearOf, monthOf, name, monthIndex, firstYearEnd, resume };
}

function init() {
    if (!W || !canvas || !stage || !webglAvailable()) {
        showFallback();
        return;
    }

    let renderer;
    try {
        renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch (error) {
        showFallback();
        return;
    }

    const projects = [...W.projects].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const count = projects.length;
    const calendar = buildCalendar(projects);
    // 첫 앱은 「첫 앱」 장이 시작되자마자 나와 크게 섰다가, 그 장이 끝날 때 달력 첫 칸(빨간 선)으로 내려앉는다.
    calendar.items[0].arrive = -0.2;
    // 게임 장(chGames의 data-from 날짜부터)에서는 그 앱들만 밝게 두고 앞의 앱은 어둡게 물린다.
    const focusFrom = chapters[3] && chapters[3].dataset.from;
    const focusMonth = focusFrom ? calendar.monthIndex(focusFrom) : Infinity;
    renderer.setClearColor(BLACK, 1);
    renderer.outputColorSpace = SRGBColorSpace;
    // 제품 사진용 톤 매핑(Khronos PBR Neutral): 밝은 빛은 부드럽게 누르고 아이콘의 원래 색 · 채도는 그대로 둔다.
    renderer.toneMapping = NeutralToneMapping;
    renderer.toneMappingExposure = 1;

    const scene = new Scene();
    scene.background = new Color(BLACK);
    const camera = new PerspectiveCamera(FOV, 1, 0.5, 700);

    // 빛은 무대마다 무채색 스튜디오 환경광 하나. 모든 재질이 같은 회전(envRotation)을 나눠 써서 띠 조명이 함께 지나간다.
    const envRotation = new Euler();
    const lowPower = !finePointerQuery.matches || Math.min(window.screen.width, window.screen.height) < 700;
    const view = { w: 1, h: 1, portrait: false, dpr: 1 };
    // 접지 그림자는 아이콘 43개 + 비어 있는 다음 자리 하나.
    const stageScene = createStage(STAGE_KIND, { renderer, scene, envRotation, lowPower, count: count + 1 });
    const envMap = stageScene.envMap;

    const geometry = tileGeometry();
    // 타일 두께는 은회색 금속: 모서리에 띠 조명이 길게 흐른다. 타일마다 따로 두어 첫 화면 뒤 줄의 모서리 빛을 낮춘다.
    const sideMaterial = () => {
        const side = new MeshPhysicalMaterial({ color: 0xffffff, metalness: 1, roughness: 0.34, envMap, envMapIntensity: 1 });
        side.envMapRotation = envRotation;
        stageScene.decorate(side);
        return side;
    };
    const faceRig = stageScene.faceRig ?? 1;
    const loader = new TextureLoader();
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const faceMaterial = () => {
        // 앞면: 아이콘 색은 스스로 빛나게(emissive) 그대로 두고, 그 위에 얇은 유리 코팅이 띠 조명을 비춘다.
        const face = new MeshPhysicalMaterial({
            color: 0x000000,
            emissive: 0x121212,
            roughness: 0.34,
            metalness: 0,
            clearcoat: 0.7,
            clearcoatRoughness: 0.06,
            envMap,
            envMapIntensity: 0.5,
        });
        face.envMapRotation = envRotation;
        stageScene.decorate(face);
        return face;
    };
    const slot = () => ({ pos: new Vector3(), rot: new Vector3(), s: 1 });

    const rand = mulberry32(43043);
    const makeTile = (project, index) => {
        const face = faceMaterial();
        const side = sideMaterial();
        const mesh = new Mesh(geometry, [face, side]);
        mesh.userData.index = index;
        scene.add(mesh);
        return {
            project,
            mesh,
            face,
            side,
            pos: new Vector3(0, 0, 0),
            vel: new Vector3(),
            rot: new Vector3(),
            scale: 0.2,
            hover: 0,
            loaded: false,
            heroRank: 0,
            heroLight: 1,
            delay: rand() * 0.3,
            delay2: rand() * 0.3,
            spin: (rand() < 0.5 ? -1 : 1) * (0.7 + rand() * 0.8),
            spinX: (rand() - 0.5) * 1.2,
            phase: rand() * Math.PI * 2,
            bob: 0.6 + rand() * 0.6,
            screen: new Vector2(),
            cal: project ? calendar.items[index] : null,
            S: slot(),
            T: slot(),
            F: slot(),
            L: slot(),
            E: slot(),
            X: index === 0 ? slot() : null,
        };
    };
    const tiles = projects.map((project, index) => makeTile(project, index));
    // 비어 있는 다음 자리(44번째). 벽에서 나타나고, 끝에서 앞으로 나온다. 누르면 메일.
    const ghost = makeTile(null, count);
    ghost.face.emissiveIntensity = 0.9;
    ghost.loaded = true;
    ghost.scale = 0;
    const meshes = tiles.map((tile) => tile.mesh);
    const allMeshes = [...meshes, ghost.mesh];


    let loaded = 0;
    loader.load(plusImage(), (texture) => {
        texture.colorSpace = SRGBColorSpace;
        texture.anisotropy = maxAniso;
        ghost.face.emissive.set(0xffffff);
        ghost.face.emissiveMap = texture;
        ghost.face.needsUpdate = true;
        requestRender();
    });
    tiles.forEach((tile) => {
        loader.load(tile.project.icon, (texture) => {
            texture.colorSpace = SRGBColorSpace;
            texture.anisotropy = maxAniso;
            tile.face.emissive.set(0xffffff);
            tile.face.emissiveMap = texture;
            tile.face.needsUpdate = true;
            tile.loaded = true;
            loaded += 1;
            requestRender();
        });
    });

    // ---------- 후처리 ----------
    // 장면 → (데스크톱만) 초점 거리 흐림 → 톤 매핑 · sRGB → SMAA → 아주 옅은 그레인.
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const dofPass = lowPower ? null : new DepthOfFieldPass(scene, camera);
    if (dofPass) composer.addPass(dofPass);
    composer.addPass(new OutputPass());
    composer.addPass(new SMAAPass());
    const grainPass = new GrainPass(0.032);
    composer.addPass(grainPass);

    // ---------- 카메라 자리 ----------
    // 달력 · 숫자 · 벽에서 쓰는 기준 카메라: 살짝 내려다보고, 바닥선이 화면 아래쪽(83%)에 오게 높이를 맞춘다.
    // 타일은 카메라를 마주 보는 판(거리 depth) 위에 화면 좌표로 놓는다.
    const rig = { pitch: 0.16, depth: 24, floorPx: 0, halfH: 1, halfW: 1, pos: new Vector3(), target: new Vector3(), fwd: new Vector3(), up: new Vector3() };
    let heroInfo = { pos: new Vector3(0, 2, 14), target: new Vector3(), focal: null, bob: 0, standing: true };
    const marks = {
        exitStart: 1,
        exitEnd: 2,
        tY: [2, 3, 4, 5, 6],
        tP: [0, 1, 2, 3, 4],
        formStart: 7,
        formEnd: 8,
        holdEnd: 9,
        wallEnd: 10,
        nextStart: 11,
        nextEnd: 12,
    };

    function updateRig() {
        rig.pitch = view.portrait ? 0.15 : 0.16;
        rig.floorPx = view.h * (view.portrait ? 0.86 : 0.83);
        const p = rig.pitch;
        const d = rig.depth;
        rig.halfH = d * Math.tan((FOV * Math.PI) / 360);
        rig.halfW = (rig.halfH * view.w) / view.h;
        const ndcFloor = 1 - (2 * rig.floorPx) / view.h;
        const height = d * Math.sin(p) - ndcFloor * rig.halfH * Math.cos(p);
        rig.fwd.set(0, -Math.sin(p), -Math.cos(p));
        rig.up.set(0, Math.cos(p), -Math.sin(p));
        rig.pos.set(0, height, d * Math.cos(p));
        rig.target.copy(rig.pos).addScaledVector(rig.fwd, d);
    }

    function planePoint(px, py) {
        const nx = (px / view.w) * 2 - 1;
        const ny = 1 - (py / view.h) * 2;
        return new Vector3().copy(rig.target).addScaledVector(RIGHT, nx * rig.halfW).addScaledVector(rig.up, ny * rig.halfH);
    }

    const worldPerPx = () => (2 * rig.halfH) / view.h;

    function relRect(el, base) {
        const r = el.getBoundingClientRect();
        const b = base.getBoundingClientRect();
        return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top };
    }

    // ---------- 출시 달력 ----------
    // 가로 화면: 달마다 막대 하나, 왼쪽에서 오른쪽으로 한 줄(해가 바뀌는 곳에 작은 틈).
    // 세로 화면: 해마다 한 판(1월~12월)씩 위아래로 쌓는다.
    const cal = { cell: 1, col: [], blocks: [], headTop: [], headBase: [] };

    function textBottom() {
        // 달력 위에 붙는 장 글(가장 긴 것)의 아래 끝(px).
        let bottom = 0;
        chapters.forEach((section) => {
            const text = section.querySelector(".chapter-text");
            const top = parseFloat(window.getComputedStyle(text).top) || 0;
            bottom = Math.max(bottom, top + text.offsetHeight);
        });
        return bottom;
    }

    function layoutCalendar() {
        const gutter = Math.max(20, Math.min(64, view.w * 0.05));
        const left = gutter;
        const right = view.w - gutter;
        const top = textBottom() + (view.portrait ? 40 : 52);
        const bottom = rig.floorPx - (view.portrait ? 18 : 26);
        const { months, counts, years, yearMax, yearOf, monthOf } = calendar;
        const gap = 0.6;
        cal.col = [];
        cal.blocks = [];
        if (!view.portrait) {
            const units = months + (years.length - 1) * gap;
            const rows = Math.max(...counts);
            const cell = Math.max(8, Math.min((right - left) / units, (bottom - top) / rows, 66));
            const x0 = (left + right) / 2 - (units * cell) / 2;
            for (let i = 0; i < months; i += 1) {
                const u = i + (yearOf(i) - years[0]) * gap;
                cal.col.push({ x: x0 + (u + 0.5) * cell, base: bottom, top: bottom - rows * cell });
            }
            years.forEach((year) => {
                const inYear = cal.col.filter((c, i) => yearOf(i) === year);
                const first = inYear[0];
                const last = inYear[inYear.length - 1];
                const firstIndex = cal.col.indexOf(first);
                cal.blocks.push({ year, x1: first.x - cell / 2, x2: last.x + cell / 2, base: bottom, cols: inYear.length, firstMonth: monthOf(firstIndex) });
            });
            cal.cell = cell;
        } else {
            const yearGap = 2.4;
            const totalRows = yearMax.reduce((sum, v) => sum + v, 0) + (years.length - 1) * yearGap;
            const cell = Math.max(8, Math.min((right - left) / 12, (bottom - top) / totalRows, 60));
            const x0 = (left + right) / 2 - (12 * cell) / 2;
            // 아래에서 위로: 마지막 해가 바닥선 위, 그 위에 앞 해.
            const bases = [];
            let base = bottom;
            for (let k = years.length - 1; k >= 0; k -= 1) {
                bases[k] = base;
                base -= (yearMax[k] + yearGap) * cell;
            }
            for (let i = 0; i < months; i += 1) {
                const k = years.indexOf(yearOf(i));
                cal.col.push({ x: x0 + (monthOf(i) + 0.5) * cell, base: bases[k], top: bases[k] - yearMax[k] * cell });
            }
            years.forEach((year, k) => {
                cal.blocks.push({ year, x1: x0, x2: x0 + 12 * cell, base: bases[k], cols: 12, firstMonth: 0 });
            });
            cal.cell = cell;
        }
        const cellWorld = cal.cell * worldPerPx();
        tiles.forEach((tile) => {
            const c = cal.col[tile.cal.month];
            tile.T.pos.copy(planePoint(c.x, c.base - (tile.cal.order + 0.5) * cal.cell));
            tile.T.rot.set(-rig.pitch, 0, 0);
            tile.T.s = cellWorld * 0.84;
        });
        // 첫 앱이 먼저 크게 서는 자리.
        const spot = tiles[0].X;
        const spotPx = view.portrait ? view.w * 0.44 : Math.min(view.h * 0.3, 300);
        const firstCol = cal.col[tiles[0].cal.month];
        spot.pos.copy(planePoint(view.portrait ? view.w * 0.5 : firstCol.x + spotPx * 0.85, view.h * (view.portrait ? 0.48 : 0.52)));
        spot.rot.set(-rig.pitch, -0.3, 0);
        spot.s = spotPx * worldPerPx();
        // 축(가는 선 + 달 눈금 + 해 이름)과 지금 달을 가리키는 빨간 선은 HTML로 그리고, 매 프레임 카메라에 맞춰 옮긴다.
        cal.blocks.forEach((block) => {
            block.a = planePoint(block.x1, block.base + 3);
            block.b = planePoint(block.x2, block.base + 3);
        });
        buildCalendarDom();
    }

    let headEl = null;
    let nowEl = null;
    let nowText = "";
    let nowWidth = 0;

    function buildCalendarDom() {
        timelineEl.textContent = "";
        cal.blocks.forEach((block) => {
            const axis = document.createElement("div");
            axis.className = "timeline-axis";
            for (let j = 0; j < block.cols; j += 1) {
                const left = `${((j + 0.5) / block.cols) * 100}%`;
                const tick = document.createElement("i");
                tick.style.left = left;
                axis.appendChild(tick);
                const month = document.createElement("b");
                month.style.left = left;
                month.textContent = String(block.firstMonth + j + 1);
                axis.appendChild(month);
            }
            const year = document.createElement("span");
            year.className = "timeline-year";
            year.textContent = String(block.year);
            axis.appendChild(year);
            timelineEl.appendChild(axis);
            block.el = axis;
        });
        headEl = document.createElement("div");
        headEl.className = "timeline-head";
        nowEl = document.createElement("span");
        nowEl.className = "timeline-now";
        headEl.appendChild(nowEl);
        timelineEl.appendChild(headEl);
        nowText = "";
    }

    const screenA = new Vector3();
    const screenB = new Vector3();
    const headWorld = new Vector3();
    const toScreen = (world, out) => {
        out.copy(world).project(camera);
        out.set((out.x * 0.5 + 0.5) * view.w, (-out.y * 0.5 + 0.5) * view.h, 0);
        return out;
    };

    function placeCalendar(opacity, p) {
        if (opacity <= 0.002) {
            if (timelineEl.style.visibility !== "hidden") timelineEl.style.visibility = "hidden";
            return;
        }
        timelineEl.style.visibility = "visible";
        timelineEl.style.opacity = opacity.toFixed(3);
        cal.blocks.forEach((block) => {
            toScreen(block.a, screenA);
            toScreen(block.b, screenB);
            block.el.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${screenA.y.toFixed(1)}px, 0)`;
            block.el.style.width = `${Math.max(0, screenB.x - screenA.x).toFixed(1)}px`;
        });
        const i = Math.max(0, Math.min(calendar.months - 1, Math.floor(p)));
        const frac = clamp01(p - i);
        const c = cal.col[i];
        const x = c.x + (frac - 0.5) * cal.cell;
        headWorld.copy(planePoint(x, c.top - 12));
        toScreen(headWorld, screenA);
        headWorld.copy(planePoint(x, c.base + 8));
        toScreen(headWorld, screenB);
        headEl.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${screenA.y.toFixed(1)}px, 0)`;
        headEl.style.height = `${Math.max(0, screenB.y - screenA.y).toFixed(1)}px`;
        let arrived = 0;
        for (const tile of tiles) if (tile.cal.arrive + 0.3 <= p) arrived += 1;
        const text = `${calendar.name(i)} · 누적 ${arrived}개`;
        if (text !== nowText) {
            nowText = text;
            nowEl.textContent = text;
            nowWidth = nowEl.offsetWidth;
        }
        // 이름표가 화면 밖으로 나가지 않게 가로로 밀어 넣는다.
        const shift = Math.max(12 - screenA.x, Math.min(view.w - 12 - screenA.x - nowWidth, -nowWidth / 2));
        nowEl.style.transform = `translateX(${shift.toFixed(1)}px)`;
    }

    function layoutForm() {
        // 위 연락 줄과 아래 바닥선 · 숫자 줄 사이 가운데에 "43"을 세운다.
        const pin = numbers.querySelector(".numbers-pin");
        const footBox = relRect(numbers.querySelector(".numbers-foot"), pin);
        const gutter = Math.max(20, Math.min(56, view.w * 0.04));
        const bottom = Math.min(footBox.top - (view.portrait ? 24 : 36), rig.floorPx - (view.portrait ? 22 : 30));
        const region = { left: gutter, right: view.w - gutter, top: view.portrait ? 84 : 104, bottom };
        const { wide, tall } = glyphCells(String(count));
        let best = null;
        for (const grid of [wide, tall]) {
            const rw = region.right - region.left;
            const rh = region.bottom - region.top;
            if (rw <= 0 || rh <= 0) continue;
            const cell = Math.min(rw / grid.cols, rh / grid.rows, view.portrait ? 60 : 62);
            if (!best || cell > best.cell + 0.5) best = { cell, grid };
        }
        const { cell, grid } = best;
        const cx = (region.left + region.right) / 2;
        const cy = (region.top + region.bottom) / 2;
        const tiltY = view.portrait ? -0.14 : -0.2;
        const tiltX = 0.07;
        const center = planePoint(cx, cy);
        const cellWorld = cell * worldPerPx();
        const cells = grid.cells;
        tiles.forEach((tile, i) => {
            const target = cells[i % cells.length];
            const lx = (target.c - (grid.cols - 1) / 2) * cellWorld;
            const ly = -(target.r - (grid.rows - 1) / 2) * cellWorld;
            // 판 전체를 살짝 돌려 타일 두께가 보이게 한다(카메라를 마주 보는 판 안에서).
            const x1 = lx * Math.cos(tiltY);
            const z1 = -lx * Math.sin(tiltY);
            const y2 = ly * Math.cos(tiltX) - z1 * Math.sin(tiltX);
            const z2 = ly * Math.sin(tiltX) + z1 * Math.cos(tiltX);
            tile.F.pos.copy(center).addScaledVector(RIGHT, x1).addScaledVector(rig.up, y2).addScaledVector(rig.fwd, -z2);
            tile.F.rot.set(-tiltX - rig.pitch, tiltY, 0);
            tile.F.s = cellWorld * 0.86;
        });
    }

    function layoutWall() {
        // 앱 43개 + 비어 있는 다음 자리 하나가 한 벽에 걸린다(다음 자리는 맨 끝 칸).
        const total = count + 1;
        const gutter = Math.max(20, Math.min(64, view.w * 0.05));
        const top = view.portrait ? 84 : 104;
        const bottom = rig.floorPx - (view.portrait ? 18 : 26);
        const left = gutter;
        const right = view.w - gutter;
        const aspect = (right - left) / Math.max(1, bottom - top);
        let cols = Math.max(3, Math.round(Math.sqrt(total * aspect)));
        let rows = Math.ceil(total / cols);
        while ((cols - 1) * rows >= total && cols > 3) {
            cols -= 1;
            rows = Math.ceil(total / cols);
        }
        const cell = Math.min((right - left) / cols, (bottom - top) / rows, 136);
        const gridW = cell * cols;
        const gridH = cell * rows;
        const x0 = (left + right) / 2 - gridW / 2 + cell / 2;
        const y0 = bottom - gridH + cell / 2;
        const cellWorld = cell * worldPerPx();
        const halfW = (gridW * worldPerPx()) / 2;
        [...tiles, ghost].forEach((tile, i) => {
            const r = Math.floor(i / cols);
            const inRow = r === rows - 1 ? total - r * cols : cols;
            const c = i - r * cols;
            const rowOffset = ((cols - inRow) * cell) / 2;
            const p = planePoint(x0 + c * cell + rowOffset, y0 + r * cell);
            const n = halfW > 0 ? (p.x - rig.target.x) / halfW : 0;
            const curve = view.portrait ? 0.35 : 1.6;
            p.addScaledVector(rig.fwd, curve * n * n);
            tile.L.pos.copy(p);
            tile.L.rot.set(-rig.pitch, (view.portrait ? -0.06 : -0.2) * n, 0);
            tile.L.s = cellWorld * 0.76;
        });
        // 끝: 다음 자리가 화면 가운데 앞으로 나온다.
        const sizePx = view.portrait ? view.w * 0.34 : view.h * 0.24;
        ghost.E.pos.copy(planePoint(view.w / 2, view.h * (view.portrait ? 0.4 : 0.37)));
        ghost.E.rot.set(-rig.pitch, -0.22, 0);
        ghost.E.s = sizePx * worldPerPx();
    }

    function measureMarks() {
        const y = window.scrollY;
        const h = view.h;
        const top = (el) => el.getBoundingClientRect().top + y;
        const heroTop = top(hero);
        const ys = chapters.map((el) => top(el) - h * 0.35);
        const games = chapters[chapters.length - 1];
        const endY = top(games) + games.offsetHeight - h * 0.9;
        marks.exitStart = heroTop + h * 0.06;
        marks.exitEnd = Math.max(marks.exitStart + 1, ys[0]);
        marks.tY = [...ys, Math.max(ys[ys.length - 1] + 1, endY)];
        for (let k = 1; k < marks.tY.length; k += 1) marks.tY[k] = Math.max(marks.tY[k], marks.tY[k - 1] + 1);
        marks.tP = [calendar.items[0].arrive - 0.15, 1, calendar.firstYearEnd, calendar.resume, calendar.months + 0.2];
        marks.tP[1] = Math.max(marks.tP[1], marks.tP[0] + 0.5);
        const numbersTop = top(numbers);
        marks.formStart = Math.max(marks.tY[marks.tY.length - 1] + 1, numbersTop - h * 0.8);
        marks.formEnd = Math.max(marks.formStart + 1, numbersTop);
        marks.holdEnd = Math.max(marks.formEnd + 1, numbersTop + numbers.offsetHeight - h);
        marks.wallEnd = Math.max(marks.holdEnd + 1, top(wall));
        const nextTop = top(nextSection);
        marks.nextStart = Math.max(marks.wallEnd + 1, nextTop - h * 0.85);
        marks.nextEnd = Math.max(marks.nextStart + 1, nextTop - h * 0.08);
    }

    function pixelRatio(w, h) {
        // 데스크톱은 최대 2, 화면이 크면 픽셀 수 상한(약 420만)에 맞춰 낮춘다. 휴대폰은 1.5.
        const device = window.devicePixelRatio || 1;
        if (lowPower) return Math.min(device, 1.5);
        return Math.max(1, Math.min(device, 2, Math.sqrt(4.2e6 / Math.max(1, w * h))));
    }

    function layoutAll() {
        updateRig();
        heroInfo = stageScene.heroLayout(tiles, view);
        layoutCalendar();
        layoutForm();
        layoutWall();
        measureMarks();
    }

    function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        view.w = w;
        view.h = h;
        view.portrait = w / h < 0.9;
        view.dpr = pixelRatio(w, h);
        renderer.setPixelRatio(view.dpr);
        renderer.setSize(w, h, false);
        composer.setPixelRatio(view.dpr);
        composer.setSize(w, h);
        stageScene.resize(w * view.dpr, h * view.dpr);
        if (dofPass) dofPass.material.uniforms.uScale.value = view.dpr;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        layoutAll();
        requestRender();
    }

    // ---------- 포인터 ----------
    const pointer = { x: 0, y: 0, nx: 0, ny: 0, inside: false, moved: false, touch: false };
    const raycaster = new Raycaster();
    const ndc = new Vector2();
    let hovered = -1;
    let selected = -1;

    function updatePointer(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
        pointer.nx = (pointer.x / rect.width) * 2 - 1;
        pointer.ny = -(pointer.y / rect.height) * 2 + 1;
        pointer.moved = true;
    }

    function pick(x, y) {
        ndc.set((x / view.w) * 2 - 1, -(y / view.h) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const targets = ghost.scale > 0.05 ? allMeshes : meshes;
        const hit = raycaster.intersectObjects(targets, false)[0];
        if (!hit) return -1;
        const index = hit.object.userData.index;
        // 아직 어둠 속에서 기다리는 아이콘은 고르지 않는다.
        if (index < count && tiles[index].face.emissiveIntensity < 0.2) return -1;
        return index;
    }

    function linkTarget(project) {
        const url = W.getStoreUrl(project);
        return { url, external: url !== project.detail };
    }

    function openIndex(index) {
        if (index === count) {
            if (mailLink) window.location.href = mailLink.href;
            return;
        }
        W.openProject(tiles[index].project);
    }

    function isInteractive(target) {
        return Boolean(target && target.closest && target.closest("a, button, input, textarea, select, label"));
    }

    window.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        pointer.touch = false;
        updatePointer(event);
        if (reduced) requestRender();
    }, { passive: true });

    document.addEventListener("mouseleave", () => {
        pointer.inside = false;
        hovered = -1;
        requestRender();
    });

    let downAt = null;
    window.addEventListener("pointerdown", (event) => {
        downAt = { x: event.clientX, y: event.clientY, t: performance.now(), type: event.pointerType };
    }, { passive: true });

    window.addEventListener("click", (event) => {
        if (!stageVisible || isInteractive(event.target)) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
        const touchLike = (downAt && downAt.type !== "mouse") || !finePointerQuery.matches;
        const index = pick(x, y);
        if (index < 0 && !reduced) stageScene.poke(raycaster.ray, clock);
        if (touchLike) {
            pointer.touch = true;
            if (index >= 0 && index === selected) {
                openIndex(index);
                return;
            }
            selected = index;
            requestRender();
            return;
        }
        if (index >= 0) openIndex(index);
    });

    // ---------- 이름표 ----------
    const labelName = label.querySelector("strong");
    const labelMeta = label.querySelector("span");
    const labelLink = label.querySelector("a");
    let labelIndex = -2;
    const projected = new Vector3();

    function platformText(project) {
        const parts = [];
        if (project.ios) parts.push("iOS");
        if (project.android) parts.push("Android");
        return parts.join(" · ");
    }

    function updateLabel(index) {
        if (index < 0) {
            if (labelIndex !== -1) label.classList.remove("is-visible");
            labelIndex = -1;
            document.body.style.cursor = "";
            return;
        }
        const tile = index === count ? ghost : tiles[index];
        if (labelIndex !== index) {
            labelIndex = index;
            if (index === count) {
                labelName.textContent = "다음 앱";
                labelMeta.textContent = `${count + 1}번째 · 비어 있음`;
                labelLink.href = mailLink ? mailLink.href : "#next";
                labelLink.textContent = "메일 보내기 →";
                labelLink.removeAttribute("target");
                labelLink.removeAttribute("rel");
            } else {
                const project = tile.project;
                labelName.textContent = project.title;
                labelMeta.textContent = `${project.date.replace(/-/g, ".")} · ${platformText(project)}`;
                const { url, external } = linkTarget(project);
                labelLink.href = url;
                labelLink.textContent = external ? "스토어에서 열기 →" : "소개 페이지 열기 →";
                if (external) {
                    labelLink.target = "_blank";
                    labelLink.rel = "noopener";
                } else {
                    labelLink.removeAttribute("target");
                    labelLink.removeAttribute("rel");
                }
            }
            label.classList.toggle("is-touch", pointer.touch);
            label.classList.add("is-visible");
        }
        document.body.style.cursor = pointer.touch ? "" : "pointer";
        const half = (tile.scale * (1 + tile.hover * 0.18)) / 2;
        projected.set(tile.pos.x, tile.pos.y + half, tile.pos.z).project(camera);
        const px = (projected.x * 0.5 + 0.5) * view.w;
        const topY = (-projected.y * 0.5 + 0.5) * view.h;
        projected.set(tile.pos.x, tile.pos.y - half, tile.pos.z).project(camera);
        const bottomY = (-projected.y * 0.5 + 0.5) * view.h;
        const lw = label.offsetWidth;
        const lh = label.offsetHeight;
        let lx = px - lw / 2;
        let ly = topY - lh - 12;
        if (ly < 64) ly = bottomY + 12;
        lx = Math.max(12, Math.min(view.w - lw - 12, lx));
        ly = Math.max(12, Math.min(view.h - lh - 12, ly));
        label.style.transform = `translate3d(${Math.round(lx)}px, ${Math.round(ly)}px, 0)`;
    }

    // ---------- 이야기 글 ----------
    // 장 글은 제자리(위쪽)에 가까워질수록 나타나고, 다음 장에 밀려 올라가면 곧 사라진다. 한 번에 한 덩어리만 읽히게.
    const heroText = hero.querySelector(".hero-text");
    const nextText = nextSection.querySelector(".next-text");
    const stickyTexts = [...chapters, wall].map((section) => section.querySelector(".chapter-text"));
    const wallText = wall.querySelector(".chapter-text");
    const textState = new Map();

    function setOpacity(el, value) {
        const v = value > 0.995 ? "" : value.toFixed(3);
        if (textState.get(el) !== v) {
            textState.set(el, v);
            el.style.opacity = v;
            el.style.visibility = value < 0.005 ? "hidden" : "";
        }
    }

    function fadeTexts(m) {
        const h = view.h;
        stickyTexts.forEach((el) => {
            const top = parseFloat(window.getComputedStyle(el).top) || 0;
            const box = el.getBoundingClientRect();
            const r = box.top;
            // 들어오는 글은 붙는 자리 바로 아래에서만 나타나고, 나가는 글은 밀려 올라가기 전에 먼저 사라진다.
            // 그래서 두 장의 글이 달력 위에 겹쳐 보이는 순간이 없다.
            let o = r > top ? clamp01(1 - (r - top) / (h * 0.12)) : clamp01(1 - (top - r) / 70);
            const rest = el.parentElement.getBoundingClientRect().bottom - (top + box.height);
            o *= clamp01((rest - h * 0.06) / (h * 0.16));
            // 벽 글은 벽이 거의 다 모였을 때 나타난다.
            if (el === wallText) o *= clamp01((m.b - 0.55) / 0.35);
            setOpacity(el, o);
        });
        // 첫 화면 글은 첫 화면을 떠나며 사라지고, 끝 글은 다음 자리가 앞으로 나올 때 나타난다.
        setOpacity(heroText, clamp01(1 - window.scrollY / (h * 0.3)));
        const r = nextText.getBoundingClientRect().top;
        setOpacity(nextText, clamp01(1 - (r - h * 0.8) / (h * 0.2)));
    }

    // ---------- 움직임 ----------
    let reduced = motionQuery.matches;
    let stageVisible = true;
    let running = false;
    let frameRequested = false;
    let last = performance.now();
    const start = performance.now();
    let clock = 0;
    let skipIntro = false;
    const stageState = { time: 0, reduced: false, scrollTurn: 0, reveal: 1, form: 0, wall: 0 };
    const target = new Vector3();
    const targetRot = new Vector3();
    const faceRot = new Vector3();
    const tmp = new Vector3();
    const toCam = new Vector3();
    const camPos = new Vector3();
    const camTarget = new Vector3();
    const viewDir = new Vector3();
    const parallax = new Vector2();
    const slope = new Vector2();

    function timelineAt(y) {
        const Y = marks.tY;
        const P = marks.tP;
        if (y <= Y[0]) return P[0];
        for (let k = 1; k < Y.length; k += 1) {
            if (y <= Y[k]) return lerp(P[k - 1], P[k], (y - Y[k - 1]) / (Y[k] - Y[k - 1]));
        }
        return P[P.length - 1];
    }

    function mixes() {
        // 스크롤 위치 → 이야기 단계: e0 첫 화면을 떠남, p 달력의 지금 달, a 숫자, b 벽, g 끝(다음 자리).
        const y = window.scrollY;
        const m = {
            e0: clamp01((y - marks.exitStart) / (marks.exitEnd - marks.exitStart)),
            p: timelineAt(y),
            a: clamp01((y - marks.formStart) / (marks.formEnd - marks.formStart)),
            b: clamp01((y - marks.holdEnd) / (marks.wallEnd - marks.holdEnd)),
            g: clamp01((y - marks.nextStart) / (marks.nextEnd - marks.nextStart)),
        };
        if (reduced) {
            // 움직임 줄이기: 구간마다 정지 배치만 보여 준다(사이를 잇는 움직임 없음).
            m.e0 = m.e0 > 0.5 ? 1 : 0;
            m.a = m.a > 0.5 ? 1 : 0;
            m.b = m.b > 0.5 ? 1 : 0;
            m.g = m.g > 0.5 ? 1 : 0;
        }
        return m;
    }

    function arrival(tile, p) {
        if (reduced) return p >= tile.cal.arrive + 0.3 ? 1 : 0;
        return easeInOut(clamp01((p - tile.cal.arrive) / 0.6));
    }

    function compose(tile, m, out) {
        // 단계별 자리를 차례로 섞는다: 첫 화면 S → 어둠 속 대기 → 달력 T → 숫자 F → 벽 L.
        const w = reduced ? m.e0 : easeInOut(clamp01((m.e0 - tile.delay * 0.5) / 0.85));
        const ar = arrival(tile, m.p);
        const ta = reduced ? m.a : easeInOut(clamp01((m.a - tile.delay) / 0.7));
        const tb = reduced ? m.b : easeInOut(clamp01((m.b - tile.delay2) / 0.7));
        // 달력 자리. 첫 앱만 큰 자리(X)에 먼저 섰다가 달력 첫 칸으로 옮겨 간다.
        let slotS = tile.T.s;
        slotPos.copy(tile.T.pos);
        slotRot.copy(tile.T.rot);
        if (tile.X) {
            const k = reduced ? (m.p >= 0.9 ? 1 : 0) : easeInOut(clamp01((m.p - 0.66) / 0.42));
            slotPos.copy(tile.X.pos).lerp(tile.T.pos, k);
            slotRot.copy(tile.X.rot).lerp(tile.T.rot, k);
            slotS = lerp(tile.X.s, tile.T.s, k);
        }
        tmp.copy(slotPos).addScaledVector(rig.fwd, WAIT_DEPTH);
        out.pos.copy(tile.S.pos).lerp(tmp, w).lerp(slotPos, ar).lerp(tile.F.pos, ta).lerp(tile.L.pos, tb);
        out.rot.copy(tile.S.rot).lerp(slotRot, w).lerp(tile.F.rot, ta).lerp(tile.L.rot, tb);
        // 차례를 기다리는 동안은 보이지 않을 만큼 작게(어둠 속 얼룩이 남지 않게), 제자리로 오며 커진다.
        out.s = lerp(lerp(lerp(tile.S.s, slotS, w) * lerp(1, ar, w), tile.F.s, ta), tile.L.s, tb);
        out.w = w;
        out.ar = ar;
        out.ta = ta;
        out.tb = tb;
        return out;
    }

    function composeGhost(m, out) {
        const gb = reduced ? m.b : easeInOut(clamp01((m.b - 0.5) / 0.5));
        const eg = reduced ? m.g : easeInOut(m.g);
        out.pos.copy(ghost.L.pos).lerp(ghost.E.pos, eg);
        out.rot.copy(ghost.L.rot).lerp(ghost.E.rot, eg);
        out.s = lerp(ghost.L.s * gb, ghost.E.s, eg);
        out.w = 1;
        out.ar = 1;
        out.ta = 1;
        out.tb = gb;
        return out;
    }

    const placed = { pos: new Vector3(), rot: new Vector3(), s: 1, w: 0, ar: 0, ta: 0, tb: 0 };
    const slotPos = new Vector3();
    const slotRot = new Vector3();

    function step(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        const time = (now - start) / 1000;
        clock = time;
        const m = mixes();
        const ec = reduced ? m.e0 : easeInOut(m.e0);
        const ea = reduced ? m.a : easeInOut(m.a);
        const eb = reduced ? m.b : easeInOut(m.b);
        const eg = reduced ? m.g : easeInOut(m.g);
        const still = reduced || skipIntro;
        const reveal = still ? 1 : easeInOut(clamp01((time - 0.15) / 2.8));
        // 게임 장: 빨간 선이 첫 게임의 달에 닿으면 앞의 앱들을 어둡게 물린다. 숫자로 모이기 시작하면 다시 모두 같은 밝기.
        const gw = reduced
            ? (m.p >= focusMonth + 0.4 && m.a < 0.5 ? 1 : 0)
            : clamp01((m.p - focusMonth) / 0.8) * (1 - clamp01(m.a * 3));

        // 마우스는 매 프레임 다시 고르고, 터치는 누른 타일을 유지한다.
        if (!pointer.touch && pointer.inside && finePointerQuery.matches && stageVisible) {
            hovered = pick(pointer.x, pointer.y);
        } else if (!pointer.touch) {
            hovered = -1;
        }
        const active = pointer.touch ? selected : hovered;

        // 카메라: 첫 화면 자리 → 기준 자리로 미끄러진다. 끝에서는 다음 자리 쪽으로 조금 다가간다.
        // 아주 느린 돌리 + 숨 + 커서 쪽으로 아주 작은 시차.
        camPos.lerpVectors(heroInfo.pos, rig.pos, ec);
        camTarget.lerpVectors(heroInfo.target, rig.target, ec);
        camPos.addScaledVector(rig.fwd, 1.6 * eg);
        if (!reduced) {
            viewDir.subVectors(camTarget, camPos).normalize();
            const intro = skipIntro ? 0 : (1 - easeOut(clamp01(time / 4.2))) * 2.6;
            const dolly = Math.sin((time * Math.PI * 2) / 46) * 0.5 * (1 - 0.6 * ec) - intro;
            camPos.addScaledVector(viewDir, dolly);
            camPos.x += Math.sin(time * 0.37) * 0.026 + Math.sin(time * 0.71 + 1.3) * 0.011;
            camPos.y += Math.sin(time * 0.29 + 2.1) * 0.02 + Math.sin(time * 0.63 + 0.4) * 0.009;
            const ease = 1 - Math.exp(-dt * 1.2);
            parallax.x += ((pointer.inside && !pointer.touch ? pointer.nx : 0) - parallax.x) * ease;
            parallax.y += ((pointer.inside && !pointer.touch ? pointer.ny : 0) - parallax.y) * ease;
            camPos.addScaledVector(RIGHT, parallax.x * 0.42);
            camPos.y += parallax.y * 0.2;
            camTarget.addScaledVector(RIGHT, parallax.x * 0.08);
        }
        camera.position.copy(camPos);
        camera.lookAt(camTarget);
        camera.updateMatrixWorld();

        // 임계 감쇠보다 조금 무겁게: 넘치거나 튀지 않고 느리게 자리를 잡는다.
        const stiffness = 14;
        const damping = 2 * Math.sqrt(stiffness) * 1.1;
        const rotEase = 1 - Math.exp(-dt * 3);
        const hoverEase = 1 - Math.exp(-dt * 4.5);

        const moveTile = (tile, i, isGhost) => {
            if (isGhost) composeGhost(m, placed);
            else compose(tile, m, placed);
            target.copy(placed.pos);
            targetRot.copy(placed.rot);
            let s = placed.s;
            const calm = 1 - placed.w;
            if (!isGhost) target.z -= 20 * eg;

            if (!reduced) {
                const bob = heroInfo.bob * calm;
                target.y += Math.sin(time * 0.3 * tile.bob + tile.phase) * 0.13 * bob;
                targetRot.x += Math.sin(time * 0.24 + tile.phase) * 0.035 * bob;
                targetRot.z += Math.cos(time * 0.21 + tile.phase) * 0.03 * bob;
                if (calm > 0.001 && stageScene.surface) {
                    // 액체 위에 뜬 타일은 그 자리의 물결을 그대로 따라 오르내리고 살짝 기운다.
                    const h = stageScene.surface(target.x, target.z, time, slope);
                    target.y += h * calm;
                    targetRot.x += slope.y * 0.4 * calm;
                    targetRot.z -= slope.x * 0.4 * calm;
                }
                if (isGhost) {
                    targetRot.y += Math.sin(time * 0.31) * 0.06 * eg;
                } else {
                    const flight = Math.sin(Math.PI * placed.ta) + Math.sin(Math.PI * placed.tb) + 0.7 * Math.sin(Math.PI * placed.ar);
                    targetRot.y += flight * tile.spin * 0.16;
                    targetRot.x += flight * tile.spinX * 0.12;
                    target.addScaledVector(rig.fwd, -flight * 0.8);
                }
            }

            tile.hover += ((i === active ? 1 : 0) - tile.hover) * (reduced ? 1 : hoverEase);
            if (tile.hover > 0.001) {
                // 첫 화면: 타일이 살짝 들리며 정면으로 돈다. 달력 · 숫자 · 벽: 앞으로 나온다.
                toCam.subVectors(camera.position, target).normalize();
                faceRot.set(-rig.pitch * (1 - calm), Math.atan2(camera.position.x - target.x, camera.position.z - target.z) * calm, 0);
                target.y += tile.hover * s * 0.14 * calm;
                target.addScaledVector(toCam, tile.hover * Math.max(0.8, s * 0.9) * (1 - calm) + tile.hover * s * 0.2 * calm);
                targetRot.lerp(faceRot, tile.hover * 0.85);
                s *= 1 + tile.hover * 0.06;
            }

            if (reduced) {
                tile.pos.copy(target);
                tile.vel.set(0, 0, 0);
                tile.rot.copy(targetRot);
                tile.scale = s;
            } else {
                tmp.copy(target).sub(tile.pos).multiplyScalar(stiffness).addScaledVector(tile.vel, -damping);
                tile.vel.addScaledVector(tmp, dt);
                tile.pos.addScaledVector(tile.vel, dt);
                tile.rot.lerp(targetRot, rotEase);
                tile.scale += (s - tile.scale) * rotEase;
            }

            tile.mesh.position.copy(tile.pos);
            tile.mesh.rotation.set(tile.rot.x, tile.rot.y, tile.rot.z);
            tile.mesh.scale.setScalar(Math.max(0.0001, tile.scale));
            tile.mesh.updateMatrix();
            if (!isGhost) {
                // 아이콘은 앞쪽(초점)부터 차례로 어둠에서 떠오른다.
                // 첫 화면: 초점 타일만 빛 한가운데, 뒤 타일은 빛 가장자리로 어둡게. 달력: 차례가 오기 전에는 꺼져 있다가 제자리에 오며 켜진다.
                // 끝: 다음 자리만 남기고 모두 어둡게 물러난다.
                const shine = still ? 1 : easeInOut(clamp01((time - 0.45 - tile.heroRank * 1.7) / 1.3));
                let lit = lerp(lerp(tile.heroLight, 0, placed.w), 1, placed.ar);
                const focus = tile.cal.month < focusMonth ? 1 - 0.67 * gw : 1;
                lit = lerp(lit, 1, Math.max(placed.ta, placed.tb)) * (1 - 0.88 * eg) * focus;
                tile.face.emissiveIntensity = tile.loaded ? shine * lit : 1;
                // 모서리 금속 빛: 첫 화면 뒤 줄은 낮게(머리 위로 은색 윗변이 포개지지 않게), 끝 장면에서는 물러난 벽과 함께 낮게.
                const edge = lerp(0.3 + 0.7 * tile.heroLight, 1, placed.w) * (1 - 0.8 * eg) * (0.55 + 0.45 * focus);
                tile.side.envMapIntensity = reveal * edge;
                tile.face.envMapIntensity = 0.5 * reveal * lerp(1, faceRig, ec) * (1 - 0.8 * eg);
            } else {
                tile.side.envMapIntensity = reveal;
                tile.face.envMapIntensity = 0.5 * reveal * lerp(1, faceRig, ec);
            }
            projected.copy(tile.pos).project(camera);
            tile.screen.set((projected.x * 0.5 + 0.5) * view.w, (-projected.y * 0.5 + 0.5) * view.h);
        };
        tiles.forEach((tile, i) => moveTile(tile, i, false));
        moveTile(ghost, count, true);


        if (dofPass && heroInfo.focal) {
            // 첫 화면에서만 맨 앞 타일에 초점을 두고 뒤를 흐린다. 달력 · 숫자 · 벽에서는 모두 또렷하게.
            const aperture = stageScene.dof.aperture * (1 - ec);
            dofPass.enabled = aperture > 0.3;
            const u = dofPass.material.uniforms;
            u.uFocus.value = camera.position.distanceTo(heroInfo.focal.pos);
            u.uAperture.value = aperture;
            u.uMaxPx.value = stageScene.dof.maxPx;
        }
        grainPass.material.uniforms.uTime.value = reduced ? 0 : time;

        stageState.time = reduced ? 0 : time;
        stageState.reduced = reduced;
        stageState.scrollTurn = reduced ? 0 : (ec + ea + eb) / 3;
        stageState.reveal = reveal;
        stageState.form = ec;
        stageState.wall = eb;
        stageScene.update(stageState);
        stageScene.prepare(renderer, camera, allMeshes);
        composer.render(dt);
        updateLabel(active);
        fadeTexts(m);
        // 달력 축 · 빨간 선은 첫 화면을 다 떠난 뒤 나타나고, 숫자로 모이기 시작하면 사라진다.
        placeCalendar(clamp01((m.e0 - 0.6) / 0.4) * (1 - clamp01(m.a / 0.35)), m.p);
        placeDot(still ? 1 - clamp01(ec / 0.3) : easeInOut(clamp01((time - 1.4) / 1.2)) * (1 - clamp01(ec / 0.3)));
    }

    // 빨간 점 하나: 첫 화면 바닥의 자리 표시. 반사 · 흐림 · 톤 매핑을 거치지 않게 화면 위에 정확한 #EF1D2D 원으로 찍는다.
    const dot = document.getElementById("stageDot");
    function placeDot(opacity) {
        if (!dot || !stageScene.markPos) return;
        if (opacity <= 0.002) {
            if (dot.style.visibility !== "hidden") dot.style.visibility = "hidden";
            return;
        }
        toScreen(stageScene.markPos, screenA);
        dot.style.visibility = "visible";
        dot.style.opacity = opacity.toFixed(3);
        dot.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${screenA.y.toFixed(1)}px, 0)`;
    }

    let frameCount = 0;
    function loop(now) {
        if (!running) return;
        frameCount += 1;
        step(now);
        requestAnimationFrame(loop);
    }

    function startLoop() {
        if (running || reduced || !stageVisible || document.hidden) return;
        running = true;
        last = performance.now();
        requestAnimationFrame(loop);
    }

    function stopLoop() {
        running = false;
    }

    function requestRender() {
        if (running || frameRequested) return;
        frameRequested = true;
        requestAnimationFrame((now) => {
            frameRequested = false;
            if (!running) step(now);
        });
    }

    // ---------- 시작 ----------
    resize();
    skipIntro = window.scrollY > marks.exitStart;
    {
        const m = mixes();
        const wasReduced = reduced;
        reduced = true;
        tiles.forEach((tile) => {
            compose(tile, m, placed);
            tile.pos.copy(placed.pos);
            tile.rot.copy(placed.rot);
            tile.scale = placed.s;
        });
        composeGhost(m, placed);
        ghost.pos.copy(placed.pos);
        ghost.rot.copy(placed.rot);
        ghost.scale = placed.s;
        reduced = wasReduced;
    }

    let resizeTimer = 0;
    let lastWidth = window.innerWidth;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // 휴대폰 주소창이 접히며 높이만 조금 바뀌는 것은 무시한다.
            if (window.innerWidth === lastWidth && Math.abs(canvas.clientHeight - view.h) < 2) {
                measureMarks();
                return;
            }
            lastWidth = window.innerWidth;
            resize();
        }, 120);
    });

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            layoutAll();
            requestRender();
        });
    }

    window.addEventListener("scroll", () => {
        if (reduced) requestRender();
    }, { passive: true });

    const observer = new IntersectionObserver((entries) => {
        stageVisible = entries[0].isIntersecting;
        if (stageVisible) {
            startLoop();
            requestRender();
        } else {
            stopLoop();
            selected = -1;
            updateLabel(-1);
        }
    });
    observer.observe(stage);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopLoop();
        else startLoop();
    });

    const onMotionChange = () => {
        reduced = motionQuery.matches;
        if (reduced) stopLoop();
        else startLoop();
        requestRender();
    };
    if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionChange);

    docEl.classList.add("webgl-ready");
    window.__wonScene = {
        tiles,
        ghost,
        marks,
        view,
        rig,
        cal,
        calendar,
        bg: STAGE_KIND,
        lowPower,
        get hero() { return heroInfo; },
        get loaded() { return loaded; },
        get running() { return running; },
        get frames() { return frameCount; },
    };
    startLoop();
    requestRender();
}

fillNextNumber();
try {
    init();
} catch (error) {
    console.warn("WebGL scene disabled:", error);
    showFallback();
}
