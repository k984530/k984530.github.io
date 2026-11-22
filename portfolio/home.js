// won-space.com 첫 화면 WebGL 장면.
// 위에서 아래로 내리면 이야기 순서대로 바뀐다. 모두 같은 무대(광택 바닥 · 띠 조명 · 반사) 위에서 일어난다.
//   첫 화면: 최신 앱이 빛 속에 서 있다.
//   출시 탑: 첫 앱부터 낸 순서대로 아이콘이 바닥 위 달별 탑에 하나씩 쌓인다(탑이 바닥에 비친다).
//            카메라는 시간 축을 따라 옆으로 천천히 움직이며 지금까지 지나온 달만 담고, 띠 조명이 지금 달의 탑을 비춘다.
//            축에는 앱을 낸 달만 놓는다(앱이 없는 달은 칸을 두지 않는다).
//   숫자: 아이콘이 모여 앱 수("43")가 된다. → 벽: 모두 한 벽에 걸린다. → 채널: 유튜브 채널마다 둥근 프로필 판 하나.
//   끝: 비어 있는 다음 자리 하나가 앞으로 나온다.
// 화면의 숫자 · 날짜는 모두 index.html의 자료(window.WON, portfolio/tools/render_apps.py가 채움)에서 계산한다.
// 무대는 portfolio/stage.js의 두 판 중 하나(?bg=1|2). 움직임은 모두 느리고 묵직하게(튀는 탄성 없음).
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
} from "./lib/three-0.186.1.min.js?v=20261122g";
import { createStage, DepthOfFieldPass, GrainPass } from "./stage.js?v=20261122g";

const W = window.WON;
const docEl = document.documentElement;
const canvas = document.getElementById("scene");
const stage = document.getElementById("stage");
const stageSticky = stage ? stage.querySelector(".stage-sticky") : null;
const label = document.getElementById("tileLabel");
const hero = document.getElementById("hero");
const numbers = document.getElementById("numbers");
const wall = document.getElementById("wall");
const channelsSection = document.getElementById("channels");
const channelList = document.getElementById("channelList");
const nextSection = document.getElementById("next");
const timelineEl = document.getElementById("timeline");
const chapters = ["chFirst", "chYear", "chGames"].map((id) => document.getElementById(id));
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

// 출시 탑: 타일 한 변 1, 한 층 높이 1.045(얇은 틈), 달 사이 1.6, 해가 바뀌는 곳은 1.4 더 띄운다.
const STORY_SIZE = 1;
const STORY_RISE = 1.045;
const STORY_GAP = 1.6;
const STORY_YEAR_GAP = 1.4;
// 아이콘 하나가 위에서 내려와 탑에 앉는 데 걸리는 길이(달 단위).
const STORY_ARRIVE = 0.35;
// 축 눈금 · 지금 선이 서는 깊이(탑 앞).
const TICK_Z = 0.62;
// 출시 탑에서 환경광을 카메라 회전에 더해 이만큼 더 돌린다. 첫 화면용 뒤쪽 낮은 판이 바닥에 흰 덩어리로 비치지 않게 화면 밖으로 보낸다.
const STORY_ENV_TURN = -0.5;

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
const smooth = (a, b, v) => {
    const t = clamp01((v - a) / (b - a));
    return t * t * (3 - 2 * t);
};
const pad2 = (n) => String(n).padStart(2, "0");

function webglAvailable() {
    try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl2"));
    } catch (error) {
        return false;
    }
}

function roundedShape(half, radius) {
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
    return shape;
}

function extrudeTile(shape, half, curveSegments) {
    // 앞면 = 그림, 옆면 = 금속 두께. 바깥 크기 1. 모서리 깎음을 촘촘히 해 빛이 매끄럽게 흐르게 한다.
    const size = half * 2;
    const uv = (vertices, index) => new Vector2((vertices[index * 3] + half) / size, (vertices[index * 3 + 1] + half) / size);
    const geometry = new ExtrudeGeometry(shape, {
        depth: 0.13,
        bevelEnabled: true,
        bevelThickness: 0.045,
        bevelSize: 0.045,
        bevelSegments: 6,
        curveSegments,
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

function tileGeometry() {
    // 둥근 사각 타일(앱 아이콘).
    const half = (1 - 0.045 * 2) / 2;
    return extrudeTile(roundedShape(half, half * 2 * 0.225), half, 12);
}

function discGeometry() {
    // 둥근 판(채널 프로필).
    const half = (1 - 0.045 * 2) / 2;
    const shape = new Shape();
    shape.absarc(0, 0, half, 0, Math.PI * 2, false);
    return extrudeTile(shape, half, 48);
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

function buildStory(projects) {
    // 앱을 낸 달만 차례로 칸(slot)을 만든다. 앱마다 칸 번호, 그 칸 안의 층, 탑에 앉는 때(칸 단위 소수).
    const parse = (text) => text.split("-").map(Number);
    const slots = [];
    const items = projects.map((project) => {
        const [y, m, d] = parse(project.date);
        let slot = slots[slots.length - 1];
        if (!slot || slot.y !== y || slot.m !== m) {
            slot = { y, m, count: 0, index: slots.length };
            slots.push(slot);
        }
        const order = slot.count;
        slot.count += 1;
        const days = new Date(y, m, 0).getDate();
        return { slot: slot.index, order, arrive: slot.index + 0.6 * ((d - 1) / days) };
    });
    const years = [];
    slots.forEach((s, j) => {
        if (!years.length || years[years.length - 1].y !== s.y) years.push({ y: s.y, first: j });
    });
    const name = (j) => `${slots[j].y}.${pad2(slots[j].m)}`;
    const firstYearEnd = slots.filter((s) => s.y === slots[0].y).length;
    return { items, slots, years, name, firstYearEnd, count: slots.length, x: [], gapX: [] };
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
    const story = buildStory(projects);
    // 끝에 이어진 게임들(appStats.gamesStart번째부터)은 게임 장에서 밝게 두고, 그 앞의 앱은 어둡게 물린다.
    const gamesStart = Math.min(count, W.appStats.gamesStart ?? count);
    const gamesArrive = gamesStart < count ? story.items[gamesStart].arrive : Infinity;
    const channelData = Array.isArray(W.channels) && channelsSection && !channelsSection.hidden ? W.channels : [];
    const hasChannels = channelData.length > 0;

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
    // 타일 두께는 은회색 금속: 모서리에 띠 조명이 길게 흐른다. 타일마다 따로 두어 장면마다 모서리 빛을 따로 낮춘다.
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
        // 앞면: 그림 색은 스스로 빛나게(emissive) 그대로 두고, 그 위에 얇은 유리 코팅이 띠 조명을 비춘다.
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
            index,
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
            cal: project ? story.items[index] : null,
            S: slot(),
            T: slot(),
            F: slot(),
            L: slot(),
            E: slot(),
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

    // ---------- 유튜브 채널: 채널마다 둥근 프로필 판(메달) 하나 ----------
    const CH0 = count + 1;
    const discGeo = hasChannels ? discGeometry() : null;
    const channelItems = channelList ? [...channelList.querySelectorAll(".channel-item")] : [];
    const channels = channelData.map((data, k) => {
        const face = faceMaterial();
        const side = sideMaterial();
        const mesh = new Mesh(discGeo, [face, side]);
        mesh.userData.index = CH0 + k;
        mesh.visible = false;
        scene.add(mesh);
        const avatar = { mesh, face, side, slot: slot(), pos: new Vector3(), rot: new Vector3(), scale: 0, loaded: false };
        return {
            data,
            avatar,
            parts: [avatar],
            hover: 0,
            delay: k * 0.07,
            label: channelItems[k] || null,
            labelPx: { x: 0, y: 0, w: 120 },
        };
    });
    const channelMeshes = channels.flatMap((c) => c.parts.map((part) => part.mesh));
    let channelTexturesRequested = false;

    function loadChannelTextures() {
        // 채널 그림은 첫 화면 전송량에 들지 않게, 숫자 장면에 가까워졌을 때 받는다.
        if (channelTexturesRequested || !hasChannels) return;
        channelTexturesRequested = true;
        channels.forEach((c) => {
            const apply = (part, src) => {
                loader.load(src, (texture) => {
                    texture.colorSpace = SRGBColorSpace;
                    texture.anisotropy = maxAniso;
                    part.face.emissive.set(0xffffff);
                    part.face.emissiveMap = texture;
                    part.face.needsUpdate = true;
                    part.loaded = true;
                    requestRender();
                });
            };
            apply(c.avatar, c.data.avatar);
        });
    }

    if (hasChannels && channelList && stageSticky) {
        // 채널 이름표(링크)는 무대 위로 옮겨 매 프레임 물체 아래에 붙인다. WebGL이 없으면 제자리의 목록으로 남는다.
        channelList.classList.add("is-stage");
        channelList.setAttribute("aria-label", "YouTube channels");
        stageSticky.appendChild(channelList);
    }

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
    // 숫자 · 벽 · 채널에서 쓰는 기준 카메라: 살짝 내려다보고, 바닥선이 화면 아래쪽(83%)에 오게 높이를 맞춘다.
    // 타일은 카메라를 마주 보는 판(거리 depth) 위에 화면 좌표로 놓는다.
    const rig = { pitch: 0.16, depth: 24, floorPx: 0, halfH: 1, halfW: 1, pos: new Vector3(), target: new Vector3(), fwd: new Vector3(), up: new Vector3() };
    let heroInfo = { pos: new Vector3(0, 2, 14), target: new Vector3(), focal: null, bob: 0, standing: true };
    const marks = {
        exitStart: 1,
        exitEnd: 2,
        tY: [2, 3, 4, 5, 6, 7, 8],
        tP: [0, 1, 1, 2, 2, 3, 3],
        holds: { first: [3, 4], yearEnd: [5, 6], games: [7, 8] },
        formStart: 9,
        formEnd: 10,
        holdEnd: 11,
        wallEnd: 12,
        chStart: 13,
        chEnd: 14,
        nextStart: 15,
        nextEnd: 16,
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

    function planePoint(px, py, depth = rig.depth) {
        // 기준 카메라에서 거리 depth인 판 위, 화면 (px, py)에 오는 점.
        const k = depth / rig.depth;
        const nx = (px / view.w) * 2 - 1;
        const ny = 1 - (py / view.h) * 2;
        return new Vector3().copy(rig.pos).addScaledVector(rig.fwd, depth).addScaledVector(RIGHT, nx * rig.halfW * k).addScaledVector(rig.up, ny * rig.halfH * k);
    }

    function floorPxAt(depth) {
        // 거리 depth인 판이 바닥(y = 0)과 만나는 화면 줄(px).
        const y0 = planePoint(view.w / 2, 0, depth).y;
        const y1 = planePoint(view.w / 2, view.h, depth).y;
        return (y0 / (y0 - y1)) * view.h;
    }

    const worldPerPx = () => (2 * rig.halfH) / view.h;

    function relRect(el, base) {
        const r = el.getBoundingClientRect();
        const b = base.getBoundingClientRect();
        return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top };
    }

    function textBottom(sections) {
        // 장 글(가장 긴 것)의 아래 끝(px). 글은 위쪽에 붙어 머문다.
        let bottom = 0;
        sections.forEach((section) => {
            const text = section && section.querySelector(".chapter-text");
            if (!text) return;
            const top = parseFloat(window.getComputedStyle(text).top) || 0;
            bottom = Math.max(bottom, top + text.offsetHeight);
        });
        return bottom;
    }

    // ---------- 출시 탑 ----------
    // 바닥 위 한 줄(x축이 시간). 칸마다 탑 하나, 아이콘은 그 달 안의 출시 순서대로 아래에서 위로 쌓인다.
    // 카메라는 시간 축을 비스듬히 바라보며(지난 달은 왼쪽 안쪽으로 물러난다), 지금까지 지나온 탑만 화면의 안전 영역에 맞춘다.
    const storyCam = {
        yaw: 0.4,
        pitch: 0.13,
        R: new Vector3(),
        U: new Vector3(),
        F: new Vector3(),
        safe: { left: 0, right: 1, top: 0, bottom: 1 },
        fitPos: new Vector3(),
        fitTarget: new Vector3(),
        pos: new Vector3(),
        target: new Vector3(),
        primed: false,
        bandX: 0,
        heights: [],
    };

    function layoutStory() {
        const n = story.count;
        let x = 0;
        const xs = [];
        story.slots.forEach((s, j) => {
            if (j > 0) {
                x += STORY_GAP;
                if (s.y !== story.slots[j - 1].y) x += STORY_YEAR_GAP;
            }
            xs.push(x);
        });
        const mid = (xs[0] + xs[n - 1]) / 2;
        story.x = xs.map((v) => v - mid);
        // 지금 선은 지금 달 탑의 오른쪽 틈(다음 달과의 가운데)에 선다.
        story.gapX = story.x.map((v, j) => (j < n - 1 ? (v + story.x[j + 1]) / 2 : v + STORY_GAP / 2));
        // 세로 화면은 더 비스듬히, 더 내려다본다: 시간 축이 화면 대각선(왼쪽 위 = 처음, 오른쪽 아래 = 지금)을 쓴다.
        storyCam.yaw = view.portrait ? 1.0 : 0.42;
        storyCam.pitch = view.portrait ? 0.42 : 0.13;
        const th = storyCam.yaw;
        const ph = storyCam.pitch;
        storyCam.F.set(-Math.sin(th) * Math.cos(ph), -Math.sin(ph), -Math.cos(th) * Math.cos(ph));
        storyCam.R.set(Math.cos(th), 0, -Math.sin(th));
        storyCam.U.crossVectors(storyCam.R, storyCam.F);
        const gutter = view.portrait ? 18 : Math.max(32, Math.min(72, view.w * 0.05));
        storyCam.safe.left = gutter;
        storyCam.safe.right = view.w - gutter;
        storyCam.safe.top = textBottom(chapters) + (view.portrait ? 44 : 48);
        storyCam.safe.bottom = view.h - (view.portrait ? 78 : 52);
        tiles.forEach((tile) => {
            const j = tile.cal.slot;
            tile.T.pos.set(story.x[j], STORY_SIZE / 2 + tile.cal.order * STORY_RISE + 0.004, 0);
            tile.T.rot.set(0, storyCam.yaw * 0.55, 0);
            tile.T.s = STORY_SIZE;
        });
        storyCam.heights = new Array(n).fill(0);
        buildTimelineDom();
        storyCam.primed = false;
    }

    function headX(p) {
        // 지금 선: 지금 달 탑의 오른쪽 틈에 머물다가, 다음 달로 넘어가는 순간 짧게 미끄러진다.
        const n = story.count;
        if (p <= 0) return story.x[0] - STORY_GAP / 2 + STORY_GAP * smooth(-1, 0, p);
        const j = Math.min(n - 1, Math.floor(p));
        const from = j === 0 ? story.x[0] - STORY_GAP / 2 : story.gapX[j - 1];
        return lerp(from, story.gapX[j], smooth(0, 0.25, p - j));
    }

    function headHeight(j) {
        const hs = storyCam.heights;
        return Math.max(1, hs[j] || 0, j > 0 ? hs[j - 1] || 0 : 0);
    }

    function currentSlot(p) {
        return Math.max(0, Math.min(story.count - 1, Math.floor(p)));
    }

    const fitPoints = [];
    for (let i = 0; i < 160; i += 1) fitPoints.push(new Vector3());

    function fitStoryCamera(p) {
        // 고정된 방향(storyCam.R · U · F)에서, 모든 점이 화면의 안전 영역 안에 들어오는 가장 가까운 카메라 자리를 바로 푼다.
        // 점 i의 카메라 좌표 x = (P−C)·R, y = (P−C)·U, z = (P−C)·F. 투시 조건 a_l ≤ x/z ≤ a_r, b_b ≤ y/z ≤ b_t는 C에 대해 선형이다.
        const n = story.count;
        const heights = storyCam.heights;
        heights.fill(0);
        tiles.forEach((tile) => {
            heights[tile.cal.slot] += arrival(tile, p);
        });
        let k = 0;
        const add = (x, y, z) => {
            fitPoints[k].set(x, y, z);
            k += 1;
        };
        for (let j = 0; j < n; j += 1) {
            const h = heights[j];
            if (h < 0.02) continue;
            const top = h * STORY_RISE;
            for (const dx of [-0.62, 0.62]) {
                for (const z of [-0.3, 0.3]) {
                    add(story.x[j] + dx, 0, z);
                    add(story.x[j] + dx, top, z);
                }
            }
            add(story.x[j], 0, TICK_Z);
        }
        story.years.forEach((year) => {
            if (heights[year.first] >= 0.02) add(story.x[year.first] - 2.6, 0, TICK_Z);
        });
        // 지금 선 · 이름표 자리, 그리고 가장 가까이 다가갔을 때의 최소 화면(첫 앱 하나만 있을 때).
        const hx = headX(p);
        const j = currentSlot(p);
        const headTop = headHeight(j) * STORY_RISE + 0.75;
        add(hx, headTop, 0);
        // 가로 화면: 이름표는 선 꼭대기 오른쪽(아직 오지 않은 쪽)에 둔다. 그 자리를 비워 둔다.
        // 세로 화면: 이름표는 축 아래(지금 달 숫자 밑)에 두고, 화면 아래 여백으로 받는다.
        if (!view.portrait) add(hx + 2.6, headTop, 0);
        add(hx - 2.1, 0, 0);
        add(hx + 1.5, 0, 0);
        add(hx, 3.1, 0);
        add(hx, 0, TICK_Z + 0.2);
        const tanV = Math.tan((FOV * Math.PI) / 360);
        const tanH = tanV * (view.w / view.h);
        const s = storyCam.safe;
        const al = ((s.left / view.w) * 2 - 1) * tanH;
        const ar = ((s.right / view.w) * 2 - 1) * tanH;
        const bt = (1 - (s.top / view.h) * 2) * tanV;
        const bb = (1 - (s.bottom / view.h) * 2) * tanV;
        let maxA = -Infinity;
        let minB = Infinity;
        let maxC = -Infinity;
        let minD = Infinity;
        const { R, U, F } = storyCam;
        for (let i = 0; i < k; i += 1) {
            const P = fitPoints[i];
            const x = P.dot(R);
            const y = P.dot(U);
            const z = P.dot(F);
            maxA = Math.max(maxA, x - ar * z);
            minB = Math.min(minB, x - al * z);
            maxC = Math.max(maxC, y - bt * z);
            minD = Math.min(minD, y - bb * z);
        }
        const delta = Math.max((maxA - minB) / (ar - al), (maxC - minD) / (bt - bb), 4);
        const alpha = (maxA - ar * delta + (minB - al * delta)) / 2;
        const beta = (maxC - bt * delta + (minD - bb * delta)) / 2;
        storyCam.fitPos.set(0, 0, 0).addScaledVector(R, alpha).addScaledVector(U, beta).addScaledVector(F, -delta);
        storyCam.fitTarget.copy(storyCam.fitPos).addScaledVector(F, delta + 6);
    }

    // 축 눈금(앱을 낸 달 숫자) · 해 이름 · 지금 선 · 이름표는 HTML로 그리고, 매 프레임 카메라에 맞춰 옮긴다.
    const tl = { axis: null, ticks: [], years: [], head: null, now: null, nowText: "", nowWidth: 0, nowCount: 0 };

    function buildTimelineDom() {
        timelineEl.textContent = "";
        const el = (cls, text) => {
            const node = document.createElement(cls === "story-head" || cls === "story-axis" ? "div" : "span");
            node.className = cls;
            if (text) node.textContent = text;
            timelineEl.appendChild(node);
            return node;
        };
        tl.axis = el("story-axis");
        tl.ticks = story.slots.map((s) => el("story-tick", pad2(s.m)));
        tl.years = story.years.map((year) => ({ el: el("story-year", String(year.y)), first: year.first }));
        tl.head = el("story-head");
        tl.now = el("story-now");
        tl.nowText = "";
    }

    const screenA = new Vector3();
    const screenB = new Vector3();
    const screenC = new Vector3();
    const worldA = new Vector3();
    const toScreen = (world, out) => {
        out.copy(world).project(camera);
        out.set((out.x * 0.5 + 0.5) * view.w, (-out.y * 0.5 + 0.5) * view.h, out.z);
        return out;
    };
    const setShown = (node, shown) => {
        const v = shown ? "" : "none";
        if (node.style.display !== v) node.style.display = v;
    };

    function arrivedCount(p) {
        let n = 0;
        for (const tile of tiles) if (arrival(tile, p) >= 0.5) n += 1;
        return n;
    }

    function placeTimeline(opacity, p) {
        if (opacity <= 0.002) {
            if (timelineEl.style.display !== "none") timelineEl.style.display = "none";
            return;
        }
        timelineEl.style.display = "";
        timelineEl.style.visibility = "visible";
        timelineEl.style.opacity = opacity.toFixed(3);
        const j = currentSlot(p);
        const hx = headX(p);
        // 가는 축: 첫 달 앞에서 지금 선까지만(지나온 구간만).
        toScreen(worldA.set(story.x[0] - 1.1, 0, TICK_Z - 0.2), screenA);
        toScreen(worldA.set(hx, 0, TICK_Z - 0.2), screenB);
        const len = Math.hypot(screenB.x - screenA.x, screenB.y - screenA.y);
        const ang = Math.atan2(screenB.y - screenA.y, screenB.x - screenA.x);
        tl.axis.style.width = `${len.toFixed(1)}px`;
        tl.axis.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${screenA.y.toFixed(1)}px, 0) rotate(${ang.toFixed(4)}rad)`;
        // 달 숫자 · 해 이름: 지금 달까지만 보인다.
        tl.ticks.forEach((tick, k) => {
            const shown = k <= j && p > k - 0.02;
            setShown(tick, shown);
            if (!shown) return;
            toScreen(worldA.set(story.x[k], 0, TICK_Z), screenA);
            tick.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${(screenA.y + 6).toFixed(1)}px, 0) translateX(-50%)`;
        });
        tl.years.forEach((year) => {
            const shown = year.first <= j && p > year.first - 0.02;
            setShown(year.el, shown);
            if (!shown) return;
            toScreen(worldA.set(story.x[year.first] - 1.05, 0, TICK_Z), screenA);
            year.el.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${(screenA.y + 6).toFixed(1)}px, 0) translateX(-50%)`;
        });
        // 지금 선: 바닥에서 지금 달 탑 꼭대기 위까지 서는 가는 빨간 선 하나. 이름표는 그 위.
        const h = headHeight(j);
        toScreen(worldA.set(hx, 0, 0), screenA);
        toScreen(worldA.set(hx, h * STORY_RISE + 0.55, 0), screenB);
        let topY = screenB.y;
        for (let k = Math.max(0, j - 1); k <= j; k += 1) {
            const hk = storyCam.heights[k] || 0;
            if (hk < 0.02) continue;
            for (const z of [-0.45, 0.45]) {
                toScreen(worldA.set(story.x[k], hk * STORY_RISE, z), screenC);
                topY = Math.min(topY, screenC.y - 14);
            }
        }
        if (topY < screenB.y && screenA.y - screenB.y > 1) {
            const t = (screenA.y - topY) / (screenA.y - screenB.y);
            screenB.set(screenA.x + (screenB.x - screenA.x) * t, topY, screenB.z);
        }
        const hl = Math.hypot(screenB.x - screenA.x, screenB.y - screenA.y);
        const ha = Math.atan2(screenB.y - screenA.y, screenB.x - screenA.x) - Math.PI / 2;
        tl.head.style.height = `${hl.toFixed(1)}px`;
        tl.head.style.transform = `translate3d(${screenA.x.toFixed(1)}px, ${screenA.y.toFixed(1)}px, 0) rotate(${ha.toFixed(4)}rad)`;
        const arrived = arrivedCount(p);
        tl.nowCount = arrived;
        const text = `${story.name(j)} · ${arrived} ${arrived === 1 ? "APP" : "APPS"}`;
        if (text !== tl.nowText) {
            tl.nowText = text;
            tl.now.textContent = text;
            tl.nowWidth = tl.now.offsetWidth;
        }
        let lx;
        let ly;
        if (view.portrait) {
            // 지금 달 숫자 바로 밑, 선 발치에서 왼쪽으로.
            toScreen(worldA.set(story.x[j], 0, TICK_Z), screenC);
            lx = Math.max(12, Math.min(view.w - 12 - tl.nowWidth, screenA.x + 6 - tl.nowWidth));
            ly = Math.min(view.h - 24, screenC.y + 26);
        } else {
            lx = Math.max(12, Math.min(view.w - 12 - tl.nowWidth, screenB.x - 8));
            ly = Math.max(12, screenB.y - 18);
        }
        tl.now.style.transform = `translate3d(${lx.toFixed(1)}px, ${ly.toFixed(1)}px, 0)`;
    }

    // ---------- 숫자 · 벽 ----------
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

    // ---------- 채널 배치 ----------
    // 채널마다 둥근 프로필 판 하나(화면 지름 ow). 화면을 가장 크게 쓰는 줄 수를 고르고(데스크톱 4 + 3, 휴대폰 2 + 3 + 2),
    // 줄마다 가운데 맞춤이라 벌집처럼 엇갈린다. 마지막 줄은 바닥 바로 위에 서서 바닥에 비치고, 그 발치를 띠 조명이 비춘다.
    // 판은 벽보다 카메라 가까이(거리 16) 세운다. 같은 화면 크기에서 바닥선이 아래로 내려가 화면을 더 넓게 쓴다.
    const CH_DEPTH = 16;
    const chBand = { x: 0, z: 0, w: 1 };
    function rowCounts(n, rows) {
        // n개를 rows줄에 고르게 나눈다. 남는 것은 가운데 줄부터(두 줄이면 윗줄부터) 하나씩 더 준다.
        const base = Math.floor(n / rows);
        const counts = new Array(rows).fill(base);
        const mid = (rows - 1) / 2;
        const order = [...counts.keys()].sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid) || a - b);
        for (let i = 0; i < n - base * rows; i += 1) counts[order[i]] += 1;
        return counts;
    }
    function layoutChannels() {
        if (!hasChannels) return;
        const n = channels.length;
        const gutter = view.portrait ? 12 : Math.max(32, Math.min(80, view.w * 0.06));
        const top = textBottom([channelsSection]) + (view.portrait ? 30 : 40);
        // 판은 바닥선 위에서 끝나고(바닥에 묻히지 않게), 마지막 줄 이름표는 바닥선 아래 반사 위에 둔다.
        // 휴대폰 이름표는 이름 · 주제가 각각 두 줄로 꺾일 수 있다(네 줄).
        const labelH = view.portrait ? 74 : 52;
        const objBottom = Math.min(floorPxAt(CH_DEPTH) - 6, view.h - labelH - (view.portrait ? 14 : 22));
        const gapY = view.portrait ? 12 : 18;
        const rw = view.w - gutter * 2;
        let best = null;
        for (let rows = 1; rows <= n; rows += 1) {
            const counts = rowCounts(n, rows);
            const cellW = rw / Math.max(...counts);
            const avail = objBottom - top - (rows - 1) * (labelH + gapY);
            if (avail <= 0) break;
            const ow = Math.min(cellW * (view.portrait ? 0.9 : 0.74), avail / rows, view.portrait ? 180 : 280);
            if (!best || ow > best.ow + 0.5) best = { rows, counts, cellW, ow };
        }
        const { rows, counts, cellW, ow } = best;
        const pitchY = ow + labelH + gapY;
        const usedH = rows * ow + (rows - 1) * (labelH + gapY);
        // 남는 세로 여백은 위 7 : 아래 3(마지막 줄이 바닥 가까이 서게).
        const y0 = top + Math.max(0, objBottom - top - usedH) * 0.7;
        const wpp = worldPerPx() * (CH_DEPTH / rig.depth);
        let k = 0;
        let bandMin = Infinity;
        let bandMax = -Infinity;
        counts.forEach((inRow, r) => {
            const cy = y0 + r * pitchY + ow / 2;
            for (let col = 0; col < inRow; col += 1, k += 1) {
                const c = channels[k];
                const cx = view.w / 2 + (col - (inRow - 1) / 2) * cellW;
                const a = c.avatar;
                a.slot.pos.copy(planePoint(cx, cy, CH_DEPTH));
                // 가장자리 판은 가운데를 향해 살짝 돈다.
                a.slot.rot.set(-rig.pitch, (view.portrait ? -0.06 : -0.16) * ((cx / view.w) * 2 - 1), 0);
                a.slot.s = ow * wpp;
                if (r === rows - 1) {
                    bandMin = Math.min(bandMin, a.slot.pos.x);
                    bandMax = Math.max(bandMax, a.slot.pos.x);
                    chBand.z = a.slot.pos.z;
                }
                // 이름표: 판 아래 끝 바로 밑, 칸 폭 안에서.
                c.labelPx.x = cx;
                c.labelPx.y = cy + ow / 2 + (view.portrait ? 8 : 12);
                c.labelPx.w = Math.min(cellW - 6, Math.max(ow * 1.2, 120));
                if (c.label) c.label.style.width = `${Math.round(c.labelPx.w)}px`;
            }
        });
        // 바닥 빛: 마지막 줄 발치, 줄 폭보다 조금 넓게.
        chBand.x = (bandMin + bandMax) / 2;
        chBand.w = (bandMax - bandMin) / 2 + ow * wpp;
    }

    function measureMarks() {
        const y = window.scrollY;
        const h = view.h;
        const top = (el) => el.getBoundingClientRect().top + y;
        const heroTop = top(hero);
        const [first, year, games] = chapters;
        const sTop = (el) => top(el) - h * 0.35;
        const firstEnd = Math.min(story.firstYearEnd, story.count) - 0.02;
        const lastEnd = story.count - 0.02;
        marks.exitStart = heroTop + h * 0.06;
        marks.exitEnd = Math.max(marks.exitStart + 1, sTop(first));
        // 장마다 앞 3/4 동안 앱이 쌓이고 나머지는 멈춰 둔다(장 글을 읽는 동안 숫자가 그대로).
        const y0 = marks.exitEnd;
        const y1 = Math.max(y0 + 1, sTop(first) + first.offsetHeight * 0.45);
        const y2 = Math.max(y1 + 1, sTop(year));
        const y3 = Math.max(y2 + 1, sTop(year) + year.offsetHeight - h * 0.62);
        const y4 = Math.max(y3 + 1, sTop(games));
        const y5 = Math.max(y4 + 1, sTop(games) + games.offsetHeight - h * 0.85);
        const y6 = Math.max(y5 + 1, top(games) + games.offsetHeight - h * 0.9);
        marks.tY = [y0, y1, y2, y3, y4, y5, y6];
        marks.tP = [story.items[0].arrive - 0.25, 0.98, 0.98, firstEnd, firstEnd, lastEnd, lastEnd];
        marks.holds = { first: [y1, y2], yearEnd: [y3, y4], games: [y5, y6] };
        const numbersTop = top(numbers);
        marks.formStart = Math.max(y6 + 1, numbersTop - h * 0.8);
        marks.formEnd = Math.max(marks.formStart + 1, numbersTop);
        marks.holdEnd = Math.max(marks.formEnd + 1, numbersTop + numbers.offsetHeight - h);
        marks.wallEnd = Math.max(marks.holdEnd + 1, top(wall));
        const nextTop = top(nextSection);
        if (hasChannels) {
            const chTop = top(channelsSection);
            marks.chStart = Math.max(marks.wallEnd + 1, chTop - h * 0.85);
            marks.chEnd = Math.max(marks.chStart + 1, chTop - h * 0.1);
        } else {
            marks.chStart = marks.wallEnd;
            marks.chEnd = marks.wallEnd + 1;
        }
        marks.nextStart = Math.max(marks.chEnd + 1, nextTop - h * 0.85);
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
        layoutStory();
        layoutForm();
        layoutWall();
        layoutChannels();
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
    let channelMix = 0;

    function pickTargets() {
        const targets = ghost.scale > 0.05 ? [...allMeshes] : [...meshes];
        if (channelMix > 0.3) targets.push(...channelMeshes);
        return targets;
    }

    function pick(x, y) {
        ndc.set((x / view.w) * 2 - 1, -(y / view.h) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        const hit = raycaster.intersectObjects(pickTargets(), false)[0];
        if (!hit) return -1;
        const index = hit.object.userData.index;
        // 아직 어둠 속에서 기다리는 아이콘 · 물러난 아이콘은 고르지 않는다.
        if (index < count && tiles[index].face.emissiveIntensity < 0.2) return -1;
        return index;
    }

    function linkTarget(project) {
        const url = W.getStoreUrl(project);
        return { url, external: url !== project.detail };
    }

    function openIndex(index) {
        if (index >= CH0) {
            const c = channels[index - CH0];
            if (c) window.open(c.data.url, "_blank", "noopener,noreferrer");
            return;
        }
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

    function updatePointer(event) {
        const rect = canvas.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.inside = pointer.x >= 0 && pointer.y >= 0 && pointer.x <= rect.width && pointer.y <= rect.height;
        pointer.nx = (pointer.x / rect.width) * 2 - 1;
        pointer.ny = -(pointer.y / rect.height) * 2 + 1;
        pointer.moved = true;
    }

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
        // 채널 묶음은 이름표가 늘 보이므로 한 번 누르면 바로 채널이 열린다.
        if (index >= CH0) {
            openIndex(index);
            return;
        }
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
        if (index < 0 || index >= CH0) {
            if (labelIndex !== -1) label.classList.remove("is-visible");
            labelIndex = -1;
            document.body.style.cursor = index >= CH0 && !pointer.touch ? "pointer" : "";
            return;
        }
        const tile = index === count ? ghost : tiles[index];
        if (labelIndex !== index) {
            labelIndex = index;
            if (index === count) {
                labelName.textContent = "Next";
                labelMeta.textContent = `${count + 1} · Open`;
                labelLink.href = mailLink ? mailLink.href : "#next";
                labelLink.textContent = "Mail →";
                labelLink.removeAttribute("target");
                labelLink.removeAttribute("rel");
            } else {
                const project = tile.project;
                labelName.textContent = project.title;
                labelName.lang = /[가-힣]/.test(project.title) ? "ko" : "";
                labelMeta.textContent = `${project.date.replace(/-/g, ".")} · ${platformText(project)}`;
                const { url, external } = linkTarget(project);
                labelLink.href = url;
                labelLink.textContent = external ? "Store →" : "Page →";
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
    const wallText = wall.querySelector(".chapter-text");
    const channelsText = hasChannels ? channelsSection.querySelector(".chapter-text") : null;
    const stickyTexts = [...chapters, wall, ...(hasChannels ? [channelsSection] : [])].map((section) => section.querySelector(".chapter-text"));
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
            let o = r > top ? clamp01(1 - (r - top) / (h * 0.12)) : clamp01(1 - (top - r) / 70);
            const rest = el.parentElement.getBoundingClientRect().bottom - (top + box.height);
            o *= clamp01((rest - h * 0.06) / (h * 0.16));
            // 벽 글은 벽이 거의 다 모였을 때, 채널 글은 채널이 들어올 때 나타난다.
            if (el === wallText) o *= clamp01((m.b - 0.55) / 0.35) * (1 - clamp01(m.c * 3));
            if (el === channelsText) o *= clamp01((m.c - 0.3) / 0.5);
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
    const stageState = { time: 0, reduced: false, scrollTurn: 0, reveal: 1, form: 0, wall: 0, story: 0, yaw: 0, bandX: 0, bandZ: 0, bandW: 0.9, band: 0 };
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
    const wait = new Vector3();
    const colLift = [];
    const colTilt = [];

    function timelineAt(y) {
        const Y = marks.tY;
        const P = marks.tP;
        if (y <= Y[0]) return P[0];
        for (let k = 1; k < Y.length; k += 1) {
            if (y <= Y[k]) return lerp(P[k - 1], P[k], (y - Y[k - 1]) / (Y[k] - Y[k - 1]));
        }
        return P[P.length - 1];
    }

    function scrollForP(p) {
        // timelineAt의 거꾸로: 지금 달이 p가 되는 첫 스크롤 위치.
        const Y = marks.tY;
        const P = marks.tP;
        if (p <= P[0]) return Y[0];
        for (let k = 1; k < Y.length; k += 1) {
            if (P[k] > P[k - 1] && p <= P[k]) return Y[k - 1] + ((p - P[k - 1]) / (P[k] - P[k - 1])) * (Y[k] - Y[k - 1]);
        }
        return Y[Y.length - 1];
    }

    function mixes() {
        // 스크롤 위치 → 이야기 단계: e0 첫 화면을 떠남, p 출시 탑의 지금 달, a 숫자, b 벽, c 채널, g 끝(다음 자리).
        const y = window.scrollY;
        const m = {
            e0: clamp01((y - marks.exitStart) / (marks.exitEnd - marks.exitStart)),
            p: timelineAt(y),
            a: clamp01((y - marks.formStart) / (marks.formEnd - marks.formStart)),
            b: clamp01((y - marks.holdEnd) / (marks.wallEnd - marks.holdEnd)),
            c: hasChannels ? clamp01((y - marks.chStart) / (marks.chEnd - marks.chStart)) : 0,
            g: clamp01((y - marks.nextStart) / (marks.nextEnd - marks.nextStart)),
        };
        if (reduced) {
            // 움직임 줄이기: 구간마다 정지 배치만 보여 준다(사이를 잇는 움직임 없음).
            m.e0 = m.e0 > 0.5 ? 1 : 0;
            m.a = m.a > 0.5 ? 1 : 0;
            m.b = m.b > 0.5 ? 1 : 0;
            m.c = m.c > 0.5 ? 1 : 0;
            m.g = m.g > 0.5 ? 1 : 0;
        }
        return m;
    }

    function arrival(tile, p) {
        if (reduced) return p >= tile.cal.arrive + STORY_ARRIVE * 0.5 ? 1 : 0;
        return easeInOut(clamp01((p - tile.cal.arrive) / STORY_ARRIVE));
    }

    function compose(tile, m, out) {
        // 단계별 자리를 차례로 섞는다: 첫 화면 S → 탑 위 대기(작게) → 출시 탑 T → 숫자 F → 벽 L.
        const w = reduced ? m.e0 : easeInOut(clamp01((m.e0 - tile.delay * 0.5) / 0.85));
        const ar = arrival(tile, m.p);
        const ta = reduced ? m.a : easeInOut(clamp01((m.a - tile.delay) / 0.7));
        const tb = reduced ? m.b : easeInOut(clamp01((m.b - tile.delay2) / 0.7));
        // 차례가 오기 전에는 자기 탑 위 어둠 속에서 보이지 않을 만큼 작게 기다리다가, 위에서 내려와 탑에 앉는다.
        wait.copy(tile.T.pos);
        wait.y += 2.6;
        wait.z -= 0.6;
        out.pos.copy(tile.S.pos).lerp(wait, w).lerp(tile.T.pos, ar).lerp(tile.F.pos, ta).lerp(tile.L.pos, tb);
        out.rot.copy(tile.S.rot).lerp(tile.T.rot, w).lerp(tile.F.rot, ta).lerp(tile.L.rot, tb);
        out.s = lerp(lerp(lerp(tile.S.s, tile.T.s, w) * lerp(1, ar, w), tile.F.s, ta), tile.L.s, tb);
        out.w = w;
        out.ar = ar;
        out.ta = ta;
        out.tb = tb;
        return out;
    }

    function composeGhost(m, out) {
        const gb = reduced ? m.b : easeInOut(clamp01((m.b - 0.5) / 0.5));
        const eg = reduced ? m.g : easeInOut(m.g);
        const ech = reduced ? m.c : easeInOut(m.c);
        out.pos.copy(ghost.L.pos).addScaledVector(rig.fwd, 20 * ech * (1 - eg)).lerp(ghost.E.pos, eg);
        out.rot.copy(ghost.L.rot).lerp(ghost.E.rot, eg);
        out.s = lerp(ghost.L.s * gb, ghost.E.s, eg);
        out.w = 1;
        out.ar = 1;
        out.ta = 1;
        out.tb = gb;
        return out;
    }

    const placed = { pos: new Vector3(), rot: new Vector3(), s: 1, w: 0, ar: 0, ta: 0, tb: 0 };

    function storyLight(tile, p, gw) {
        // 지금 달 탑은 띠 조명 아래 원래 밝기, 지난 달은 조금 어둡게. 게임 장에서는 게임만 밝고 그 앞은 33% 안팎.
        const d = p - tile.cal.slot;
        const cur = d < 0 ? 1 : clamp01(1 - (d - 1) / 0.4);
        const base = 0.58 + 0.42 * cur;
        if (tile.index >= gamesStart) return lerp(base, 1, gw);
        return base * (1 - 0.45 * gw);
    }

    function step(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        const time = (now - start) / 1000;
        clock = time;
        const m = mixes();
        const ec = reduced ? m.e0 : easeInOut(m.e0);
        const ea = reduced ? m.a : easeInOut(m.a);
        const eb = reduced ? m.b : easeInOut(m.b);
        const ech = reduced ? m.c : easeInOut(m.c);
        const eg = reduced ? m.g : easeInOut(m.g);
        const still = reduced || skipIntro;
        const reveal = still ? 1 : easeInOut(clamp01((time - 0.15) / 2.8));
        // 게임 장: 첫 게임이 탑에 앉기 시작하면 앞의 앱들을 어둡게 물린다. 숫자로 모이기 시작하면 다시 모두 같은 밝기.
        const gw = reduced
            ? (m.p >= gamesArrive + STORY_ARRIVE * 0.5 && m.a < 0.5 ? 1 : 0)
            : clamp01((m.p - gamesArrive + 0.1) / 0.5) * (1 - clamp01(m.a * 3));
        // 벽이 물러나는 정도: 채널이 들어오거나(있을 때) 끝에서 다음 자리가 나올 때.
        // 밝기는 채널 장면에서 0(완전히 어둠), 끝 장면에서 12%(다음 자리 뒤로 벽이 희미하게 남는다).
        const away = hasChannels ? Math.max(ech, eg) : eg;
        const dimAway = hasChannels ? 1 - ech * (1 - eg) - 0.88 * eg : 1 - 0.88 * eg;
        const storyMix = ec * (1 - ea);
        channelMix = hasChannels ? ech * (1 - eg) : 0;
        if (hasChannels && (m.a > 0 || m.b > 0 || m.c > 0)) loadChannelTextures();

        // 마우스는 매 프레임 다시 고르고, 터치는 누른 타일을 유지한다.
        if (!pointer.touch && pointer.inside && finePointerQuery.matches && stageVisible) {
            hovered = pick(pointer.x, pointer.y);
        } else if (!pointer.touch) {
            hovered = -1;
        }
        const active = pointer.touch ? selected : hovered;

        // 카메라: 첫 화면 자리 → 출시 탑을 담는 자리(지금 달을 따라 옆으로) → 기준 자리. 끝에서는 다음 자리 쪽으로 조금 다가간다.
        fitStoryCamera(m.p);
        if (reduced || !storyCam.primed) {
            storyCam.pos.copy(storyCam.fitPos);
            storyCam.target.copy(storyCam.fitTarget);
            storyCam.primed = true;
        } else {
            const k = 1 - Math.exp(-dt * 3.2);
            storyCam.pos.lerp(storyCam.fitPos, k);
            storyCam.target.lerp(storyCam.fitTarget, k);
        }
        camPos.lerpVectors(heroInfo.pos, storyCam.pos, ec).lerp(rig.pos, ea);
        camTarget.lerpVectors(heroInfo.target, storyCam.target, ec).lerp(rig.target, ea);
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

        // 띠 조명은 지금 달 탑 발치로 천천히 옮겨 간다.
        const bandTo = story.x[currentSlot(m.p)];
        storyCam.bandX = reduced ? bandTo : lerp(storyCam.bandX, bandTo, 1 - Math.exp(-dt * 3));

        // 액체 판: 출시 탑은 탑째로 수면을 따라 오르내린다.
        if (stageScene.surface) {
            for (let j = 0; j < story.count; j += 1) {
                colLift[j] = stageScene.surface(story.x[j], 0, time, slope) + 0.07;
                colTilt[j] = colTilt[j] || new Vector2();
                colTilt[j].copy(slope);
            }
        }

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
            if (!isGhost) target.addScaledVector(rig.fwd, 20 * away);

            if (!isGhost && stageScene.surface) {
                // 출시 탑 위의 타일은 탑째로 수면을 따라간다(숫자 · 벽으로 옮겨 가면 풀린다).
                const sw = placed.w * (1 - placed.ta);
                if (sw > 0.001) {
                    const j = tile.cal.slot;
                    target.y += colLift[j] * sw;
                    targetRot.x += colTilt[j].y * 0.25 * sw;
                    targetRot.z -= colTilt[j].x * 0.25 * sw;
                }
            }

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
                    const flight = Math.sin(Math.PI * placed.ta) + Math.sin(Math.PI * placed.tb);
                    targetRot.y += flight * tile.spin * 0.16 + Math.sin(Math.PI * placed.ar) * tile.spin * 0.12 * placed.w;
                    targetRot.x += flight * tile.spinX * 0.12;
                    target.addScaledVector(rig.fwd, -flight * 0.8);
                }
            }

            tile.hover += ((i === active ? 1 : 0) - tile.hover) * (reduced ? 1 : hoverEase);
            if (tile.hover > 0.001) {
                // 첫 화면: 타일이 살짝 들리며 정면으로 돈다. 출시 탑 · 숫자 · 벽: 앞으로 나온다.
                toCam.subVectors(camera.position, target).normalize();
                faceRot.set(-rig.pitch * (1 - calm), Math.atan2(camera.position.x - target.x, camera.position.z - target.z) * calm, 0);
                target.y += tile.hover * s * 0.14 * calm;
                target.addScaledVector(toCam, tile.hover * Math.max(0.5, s * 0.9) * (1 - calm) + tile.hover * s * 0.2 * calm);
                targetRot.lerp(faceRot, tile.hover * 0.85 * calm);
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
                // 첫 화면: 초점 타일만 빛 한가운데, 뒤 타일은 빛 가장자리로 어둡게. 출시 탑: 탑에 앉으며 켜진다.
                // 채널 · 끝: 물러난 벽과 함께 어둡게.
                const shine = still ? 1 : easeInOut(clamp01((time - 0.45 - tile.heroRank * 1.7) / 1.3));
                const sl = storyLight(tile, m.p, gw);
                let lit = lerp(lerp(tile.heroLight, 0, placed.w), sl, placed.ar);
                lit = lerp(lit, 1, Math.max(placed.ta, placed.tb)) * dimAway;
                tile.face.emissiveIntensity = tile.loaded ? shine * lit : 1;
                // 모서리 금속 빛: 첫 화면 뒤 줄은 낮게(머리 위로 은색 윗변이 포개지지 않게), 탑에서는 지금 달만 밝게.
                const edgeStory = lerp(0.3 + 0.7 * tile.heroLight, 0.4 + 0.6 * sl, placed.w);
                const edge = lerp(edgeStory, 1, Math.max(placed.ta, placed.tb)) * dimAway;
                tile.side.envMapIntensity = reveal * edge;
                tile.face.envMapIntensity = 0.5 * reveal * lerp(1, faceRig, ec) * dimAway;
            } else {
                const gDim = hasChannels ? 1 - 0.85 * ech * (1 - eg) : 1;
                tile.face.emissiveIntensity = 0.9 * gDim;
                tile.side.envMapIntensity = reveal * gDim;
                tile.face.envMapIntensity = 0.5 * reveal * lerp(1, faceRig, ec) * gDim;
            }
            projected.copy(tile.pos).project(camera);
            tile.screen.set((projected.x * 0.5 + 0.5) * view.w, (-projected.y * 0.5 + 0.5) * view.h);
        };
        tiles.forEach((tile, i) => moveTile(tile, i, false));
        moveTile(ghost, count, true);
        if (hasChannels) moveChannels(m, ech, eg, dt, time, active, reveal);

        if (dofPass && heroInfo.focal) {
            // 첫 화면에서만 맨 앞 타일에 초점을 두고 뒤를 흐린다. 출시 탑 · 숫자 · 벽에서는 모두 또렷하게.
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
        stageState.form = ea;
        stageState.wall = eb;
        stageState.story = storyMix;
        stageState.yaw = (storyCam.yaw + STORY_ENV_TURN) * storyMix;
        // 띠 조명이 바닥에 떨어지는 자리: 출시 탑에서는 지금 달 탑 발치, 채널 장면에서는 프로필 판 마지막 줄 발치.
        const storyBand = storyMix * clamp01((m.p - story.items[0].arrive + 0.1) / 0.4);
        const channelBand = channelMix * 0.9;
        if (channelBand > storyBand) {
            stageState.bandX = chBand.x;
            stageState.bandZ = chBand.z;
            stageState.bandW = chBand.w;
            stageState.band = channelBand;
        } else {
            stageState.bandX = storyCam.bandX;
            stageState.bandZ = 0;
            stageState.bandW = 0.95;
            stageState.band = storyBand;
        }
        stageScene.update(stageState);
        stageScene.prepare(renderer, camera, allMeshes);
        composer.render(dt);
        updateLabel(active);
        fadeTexts(m);
        // 출시 탑 눈금 · 지금 선은 첫 화면을 다 떠난 뒤 나타나고, 숫자로 모이기 시작하면 사라진다.
        placeTimeline(clamp01((m.e0 - 0.6) / 0.4) * (1 - clamp01(m.a / 0.35)), m.p);
        placeDot(still ? 1 - clamp01(ec / 0.3) : easeInOut(clamp01((time - 1.4) / 1.2)) * (1 - clamp01(ec / 0.3)));
        if (hasChannels) placeChannelLabels(m, ech, eg);
    }

    // ---------- 채널 움직임 ----------
    function moveChannels(m, ech, eg, dt, time, active, reveal) {
        const rotEase = reduced ? 1 : 1 - Math.exp(-dt * 3);
        const hoverEase = reduced ? 1 : 1 - Math.exp(-dt * 5);
        channels.forEach((c, k) => {
            const arrive = reduced ? m.c : easeInOut(clamp01((m.c - c.delay) / 0.62));
            const leave = eg;
            const shown = arrive * (1 - leave);
            const visible = arrive > 0.002 && leave < 0.995;
            c.hover += ((active === CH0 + k ? 1 : 0) - c.hover) * hoverEase;
            c.parts.forEach((part) => {
                part.mesh.visible = visible;
                if (!visible) return;
                target.copy(part.slot.pos)
                    .addScaledVector(rig.fwd, 18 * (1 - arrive) + 16 * leave)
                    .addScaledVector(rig.fwd, -0.9 * c.hover);
                targetRot.copy(part.slot.rot);
                if (!reduced) {
                    // 판마다 아주 느리게 좌우로 기울어 은색 테두리에 띠 조명이 번갈아 맺힌다.
                    targetRot.y += Math.sin(Math.PI * arrive) * 0.18 + Math.sin(time * 0.27 + k * 1.3) * 0.07;
                    target.addScaledVector(rig.up, Math.sin(time * 0.31 + k * 1.7) * 0.03);
                }
                const s = part.slot.s * lerp(0.6, 1, arrive) * (1 + 0.05 * c.hover);
                if (reduced || part.scale === 0) {
                    part.pos.copy(target);
                    part.rot.copy(targetRot);
                    part.scale = s;
                } else {
                    part.pos.lerp(target, rotEase * 1.4 > 1 ? 1 : rotEase * 1.4);
                    part.rot.lerp(targetRot, rotEase);
                    part.scale += (s - part.scale) * rotEase;
                }
                part.mesh.position.copy(part.pos);
                part.mesh.rotation.set(part.rot.x, part.rot.y, part.rot.z);
                part.mesh.scale.setScalar(Math.max(0.0001, part.scale));
                part.mesh.updateMatrix();
                part.face.emissiveIntensity = part.loaded ? (0.88 + 0.12 * c.hover) * shown : 0.05;
                part.side.envMapIntensity = reveal * (0.55 + 0.65 * shown);
                part.face.envMapIntensity = 0.45 * reveal * shown;
            });
        });
    }

    function placeChannelLabels(m, ech, eg) {
        channels.forEach((c, k) => {
            if (!c.label) return;
            const arrive = reduced ? m.c : easeInOut(clamp01((m.c - c.delay - 0.25) / 0.5));
            const o = arrive * (1 - clamp01(eg * 2.5));
            if (o < 0.01) {
                if (c.label.style.visibility !== "hidden") {
                    c.label.style.visibility = "hidden";
                    c.label.style.opacity = "0";
                }
                return;
            }
            c.label.style.visibility = "visible";
            c.label.style.opacity = o > 0.995 ? "" : o.toFixed(3);
            const x = Math.max(8, Math.min(view.w - 8 - c.labelPx.w, c.labelPx.x - c.labelPx.w / 2));
            c.label.style.transform = `translate3d(${x.toFixed(1)}px, ${c.labelPx.y.toFixed(1)}px, 0)`;
            c.label.classList.toggle("is-active", o > 0.5);
        });
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

    // ---------- 검사: 화면에 보이는 아이콘 수 = 이름표 숫자 ----------
    // 아이콘 하나를 「보인다」고 세는 조건: 화면 안, 화면에서 6px 이상, 밝기 15% 이상, 카메라에서 그 중심까지 다른 물체에 가리지 않음.
    const auditRay = new Raycaster();
    const auditDir = new Vector3();
    const auditUp = new Vector3();
    function isVisible(mesh, pos, scale, emissive) {
        if (!mesh.visible || scale <= 0.0005 || emissive < 0.15) return false;
        toScreen(pos, screenA);
        if (screenA.z > 1 || screenA.x < 0 || screenA.x > view.w || screenA.y < 0 || screenA.y > view.h) return false;
        auditUp.set(0, 1, 0).applyQuaternion(camera.quaternion).multiplyScalar(scale / 2).add(pos);
        toScreen(auditUp, screenB);
        if (Math.hypot(screenB.x - screenA.x, screenB.y - screenA.y) * 2 < 6) return false;
        auditDir.subVectors(pos, camera.position);
        const dist = auditDir.length();
        auditDir.normalize();
        auditRay.set(camera.position, auditDir);
        const targets = [...allMeshes, ...channelMeshes].filter((o) => o.visible);
        const hit = auditRay.intersectObjects(targets, false)[0];
        return !hit || hit.object === mesh || hit.distance > dist - scale * 0.2;
    }

    function audit() {
        const m = mixes();
        let apps = 0;
        let bright = 0;
        let hidden = 0;
        tiles.forEach((tile) => {
            const e = tile.face.emissiveIntensity;
            if (isVisible(tile.mesh, tile.pos, tile.scale, e)) {
                apps += 1;
                if (e >= 0.9) bright += 1;
            } else if (tile.scale > 0.05 && e >= 0.15) {
                hidden += 1;
            }
        });
        const ghostShown = isVisible(ghost.mesh, ghost.pos, ghost.scale, ghost.face.emissiveIntensity);
        let channelObjects = 0;
        channels.forEach((c) => {
            const a = c.avatar;
            if (isVisible(a.mesh, a.pos, a.scale, a.face.emissiveIntensity)) channelObjects += 1;
        });
        const timelineShown = timelineEl.style.display !== "none" && timelineEl.style.visibility === "visible" && parseFloat(timelineEl.style.opacity || "1") > 0.5;
        return {
            scroll: Math.round(window.scrollY),
            p: Number(m.p.toFixed(3)),
            label: timelineShown ? tl.nowText : null,
            labelCount: timelineShown ? tl.nowCount : null,
            visibleApps: apps,
            brightApps: bright,
            notVisibleButLit: hidden,
            ghost: ghostShown,
            channelObjects,
        };
    }

    function stops() {
        // 장면마다 사진을 찍을 스크롤 위치(움직임이 멈춘 자리).
        const mid = (pair) => (pair[0] + pair[1]) / 2;
        const max = document.documentElement.scrollHeight - view.h;
        const clampY = (v) => Math.max(0, Math.min(max, Math.round(v)));
        const out = {
            hero: 0,
            first: clampY(mid(marks.holds.first)),
            year: clampY(scrollForP(5.98)),
            yearEnd: clampY(mid(marks.holds.yearEnd)),
            games: clampY(mid(marks.holds.games)),
            numbers: clampY((marks.formEnd + marks.holdEnd) / 2),
            wall: clampY((marks.wallEnd + marks.chStart) / 2),
            next: clampY(marks.nextEnd + view.h * 0.05),
        };
        if (hasChannels) out.channels = clampY((marks.chEnd + marks.nextStart) / 2);
        return out;
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
        channels,
        marks,
        view,
        rig,
        story,
        storyCam,
        bg: STAGE_KIND,
        lowPower,
        audit,
        stops,
        scrollForP,
        // 검사용: 채널 k 프로필 판 가운데의 화면 좌표.
        channelScreen(k) {
            const c = channels[k];
            if (!c) return null;
            toScreen(c.avatar.pos, screenA);
            return { x: screenA.x, y: screenA.y };
        },
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
