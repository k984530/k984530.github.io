// won-space.com 첫 화면 WebGL 장면.
// 실제 앱 아이콘 타일이 흩어져 떠 있다가(첫 화면) → 앱 수 모양으로 모이고(숫자) → 갤러리 벽이 된다(전체 앱).
// three.js 0.186.1을 portfolio/lib에 고정해 쓴다(빌드 없이 ES module로 열린다).
import {
    Color,
    DirectionalLight,
    ExtrudeGeometry,
    Mesh,
    MeshStandardMaterial,
    NoToneMapping,
    PerspectiveCamera,
    PMREMGenerator,
    Raycaster,
    RoomEnvironment,
    Scene,
    Shape,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "./lib/three-0.186.1.min.js";

const W = window.WON;
const docEl = document.documentElement;
const canvas = document.getElementById("scene");
const stage = document.getElementById("stage");
const label = document.getElementById("tileLabel");
const hero = document.getElementById("hero");
const numbers = document.getElementById("numbers");
const wall = document.getElementById("wall");

const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointerQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

const BLACK = 0x080808;
const FOV = 30;
const CAM_Z = 24;

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
        link.title = `${project.title} · ${project.year}`;
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

function webglAvailable() {
    try {
        const probe = document.createElement("canvas");
        return Boolean(probe.getContext("webgl2") || probe.getContext("webgl"));
    } catch (error) {
        return false;
    }
}

function tileGeometry() {
    // 둥근 사각 타일(앞면 = 아이콘, 옆면 = 흰 두께). 바깥 크기 1 × 1.
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
        bevelSegments: 3,
        curveSegments: 7,
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
    geometry.computeBoundingSphere();
    return geometry;
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

function init() {
    if (!W || !canvas || !stage || !webglAvailable()) {
        showFallback();
        return;
    }

    let renderer;
    try {
        renderer = new WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
        showFallback();
        return;
    }

    const projects = [...W.projects].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
    const count = projects.length;
    renderer.setClearColor(BLACK, 1);
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = NoToneMapping;

    const scene = new Scene();
    scene.background = new Color(BLACK);
    const camera = new PerspectiveCamera(FOV, 1, 0.1, 120);
    camera.position.set(0, 0, CAM_Z);

    const pmrem = new PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    // scene.environment에는 재질별 envMapIntensity가 먹지 않으므로 재질마다 envMap을 직접 건다.
    const envMap = pmrem.fromScene(room, 0.04).texture;
    room.dispose();
    pmrem.dispose();

    const key = new DirectionalLight(0xffffff, 1.8);
    key.position.set(-5, 7, 9);
    scene.add(key);
    const rim = new DirectionalLight(0xffffff, 0.9);
    rim.position.set(6, -3, 4);
    scene.add(rim);

    const geometry = tileGeometry();
    const sideMaterial = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.38, metalness: 0, envMap, envMapIntensity: 0.55 });
    const loader = new TextureLoader();
    const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const rand = mulberry32(43043);
    const tiles = projects.map((project, index) => {
        // 앞면은 아이콘 색을 그대로 내도록 스스로 빛나게(emissive) 두고, 빛은 반사·옆면 음영에만 쓴다.
        const face = new MeshStandardMaterial({
            color: 0x000000,
            emissive: 0x121212,
            roughness: 0.42,
            metalness: 0,
            envMap,
            envMapIntensity: 0.025,
        });
        const mesh = new Mesh(geometry, [face, sideMaterial]);
        mesh.userData.index = index;
        mesh.matrixAutoUpdate = true;
        scene.add(mesh);
        return {
            project,
            mesh,
            face,
            pos: new Vector3(0, 0, -60),
            vel: new Vector3(),
            rot: new Vector3(),
            scale: 0.2,
            hover: 0,
            push: new Vector3(),
            tilt: new Vector2(),
            delay: rand() * 0.3,
            delay2: rand() * 0.3,
            spin: (rand() < 0.5 ? -1 : 1) * (0.7 + rand() * 0.8),
            spinX: (rand() - 0.5) * 1.2,
            phase: rand() * Math.PI * 2,
            bob: 0.6 + rand() * 0.6,
            introDelay: index / count,
            screen: new Vector2(),
            S: { pos: new Vector3(), rot: new Vector3(), s: 1 },
            F: { pos: new Vector3(), rot: new Vector3(), s: 1 },
            L: { pos: new Vector3(), rot: new Vector3(), s: 1 },
        };
    });
    const meshes = tiles.map((tile) => tile.mesh);

    let loaded = 0;
    tiles.forEach((tile) => {
        loader.load(tile.project.icon, (texture) => {
            texture.colorSpace = SRGBColorSpace;
            texture.anisotropy = maxAniso;
            tile.face.emissive.set(0xffffff);
            tile.face.emissiveMap = texture;
            tile.face.needsUpdate = true;
            loaded += 1;
            requestRender();
        });
    });

    // ---------- 배치 ----------
    const view = { w: 1, h: 1, visW: 1, visH: 1, portrait: false };
    const marks = { formStart: 1, formEnd: 2, holdEnd: 3, wallEnd: 4 };

    function pxToWorld(px, py, z) {
        const k = (CAM_Z - z) / CAM_Z;
        return new Vector3((px / view.w - 0.5) * view.visW * k, (0.5 - py / view.h) * view.visH * k, z);
    }

    function worldPerPx(z) {
        return (view.visH / view.h) * ((CAM_Z - z) / CAM_Z);
    }

    function relRect(el, base) {
        const r = el.getBoundingClientRect();
        const b = base.getBoundingClientRect();
        return { left: r.left - b.left, top: r.top - b.top, right: r.right - b.left, bottom: r.bottom - b.top };
    }

    function textRects() {
        const rects = [];
        hero.querySelectorAll(".hero-title span, .hero-lede, .hero-sub, .hero-eyebrow, .hero-cue").forEach((el) => {
            const range = document.createRange();
            range.selectNodeContents(el);
            for (const r of range.getClientRects()) {
                const base = hero.getBoundingClientRect();
                rects.push({ left: r.left - base.left - 14, top: r.top - base.top - 14, right: r.right - base.left + 14, bottom: r.bottom - base.top + 14 });
            }
        });
        return rects;
    }

    function layoutScatter() {
        const rects = textRects();
        rects.push({ left: 0, top: 0, right: view.w, bottom: 64 });
        const r = mulberry32(2025);
        const placed = [];
        const base = view.portrait ? Math.max(40, Math.min(50, view.w * 0.125)) : Math.max(58, Math.min(92, view.h * 0.085));
        tiles.forEach((tile) => {
            let best = null;
            let bestScore = -Infinity;
            for (let attempt = 0; attempt < 64; attempt += 1) {
                // 글자 · 화면 가장자리와 겹치지 않는 자리 중 다른 타일과 가장 먼 곳(best-candidate).
                const z = lerp(-9, 3, r());
                const sizePx = (base * (0.72 + r() * 0.5) * CAM_Z) / (CAM_Z - z);
                const half = sizePx * 0.66;
                const px = half + 6 + r() * Math.max(1, view.w - half * 2 - 12);
                const py = 64 + half + r() * Math.max(1, view.h - 64 - half * 2 - 6);
                const box = { left: px - half, top: py - half, right: px + half, bottom: py + half };
                let overlap = 0;
                for (const t of rects) {
                    const ox = Math.max(0, Math.min(box.right, t.right) - Math.max(box.left, t.left));
                    const oy = Math.max(0, Math.min(box.bottom, t.bottom) - Math.max(box.top, t.top));
                    overlap += ox * oy;
                }
                let nearest = Infinity;
                for (const p of placed) {
                    const d = Math.hypot(p.px - px, p.py - py) - (p.size + sizePx) * 0.5;
                    nearest = Math.min(nearest, d);
                }
                const score = overlap > 0 ? -overlap - 1000 : Math.min(nearest, 240);
                if (score > bestScore) {
                    bestScore = score;
                    best = { px, py, z, size: sizePx };
                }
            }
            placed.push(best);
            const world = pxToWorld(best.px, best.py, best.z);
            tile.S.pos.copy(world);
            tile.S.s = best.size * worldPerPx(best.z);
            tile.S.rot.set((r() - 0.5) * 1.1, (r() - 0.5) * 1.5, (r() - 0.5) * 0.7);
        });
    }

    function layoutForm() {
        const pin = numbers.querySelector(".numbers-pin");
        const head = relRect(numbers.querySelector(".numbers-head"), pin);
        const titleRange = document.createRange();
        titleRange.selectNodeContents(numbers.querySelector(".section-title"));
        const pinLeft = pin.getBoundingClientRect().left;
        const titleRight = Math.max(...[...titleRange.getClientRects()].map((r) => r.right - pinLeft), 0);
        const statsBox = relRect(numbers.querySelector(".stats"), pin);
        const gutter = Math.max(16, Math.min(56, view.w * 0.04));
        const regions = [
            { left: gutter, right: view.w - gutter, top: head.bottom + 18, bottom: statsBox.top - 22 },
        ];
        if (!view.portrait) {
            regions.push({ left: titleRight + 56, right: view.w - gutter, top: 84, bottom: statsBox.top - 22 });
        }
        const { wide, tall } = glyphCells(String(count));
        let best = null;
        for (const region of regions) {
            for (const grid of [wide, tall]) {
                const rw = region.right - region.left;
                const rh = region.bottom - region.top;
                if (rw <= 0 || rh <= 0) continue;
                const cell = Math.min(rw / grid.cols, rh / grid.rows, view.portrait ? 64 : 76);
                if (!best || cell > best.cell + 0.5) best = { cell, grid, region };
            }
        }
        const { cell, grid, region } = best;
        const cx = (region.left + region.right) / 2;
        const cy = (region.top + region.bottom) / 2;
        const tiltY = view.portrait ? -0.16 : -0.24;
        const tiltX = 0.08;
        const centerWorld = pxToWorld(cx, cy, 0);
        const cellWorld = cell * worldPerPx(0);
        const cells = grid.cells;
        tiles.forEach((tile, i) => {
            const target = cells[i % cells.length];
            const layer = Math.floor(i / cells.length);
            const lx = (target.c - (grid.cols - 1) / 2) * cellWorld;
            const ly = -(target.r - (grid.rows - 1) / 2) * cellWorld;
            const lz = -layer * cellWorld * 1.1;
            // 판 전체를 살짝 돌려 타일 두께가 보이게 한다.
            const x1 = lx * Math.cos(tiltY) + lz * Math.sin(tiltY);
            const z1 = -lx * Math.sin(tiltY) + lz * Math.cos(tiltY);
            const y2 = ly * Math.cos(tiltX) - z1 * Math.sin(tiltX);
            const z2 = ly * Math.sin(tiltX) + z1 * Math.cos(tiltX);
            tile.F.pos.set(centerWorld.x + x1, centerWorld.y + y2, z2);
            tile.F.rot.set(-tiltX, tiltY, 0);
            tile.F.s = cellWorld * 0.86;
        });
    }

    function layoutWall() {
        const head = relRect(wall.querySelector(".wall-head"), wall);
        const gutter = Math.max(16, Math.min(56, view.w * 0.04));
        const top = head.bottom + (view.portrait ? 22 : 30);
        const bottom = view.h - (view.portrait ? 22 : 34);
        const left = gutter;
        const right = view.w - gutter;
        const aspect = (right - left) / Math.max(1, bottom - top);
        let cols = Math.max(3, Math.round(Math.sqrt(count * aspect)));
        let rows = Math.ceil(count / cols);
        while ((cols - 1) * rows >= count && cols > 3) {
            cols -= 1;
            rows = Math.ceil(count / cols);
        }
        const cell = Math.min((right - left) / cols, (bottom - top) / rows, 150);
        const gridW = cell * cols;
        const gridH = cell * rows;
        const x0 = (left + right) / 2 - gridW / 2 + cell / 2;
        const y0 = (top + bottom) / 2 - gridH / 2 + cell / 2;
        const cellWorld = cell * worldPerPx(0);
        const halfW = (gridW * worldPerPx(0)) / 2;
        tiles.forEach((tile, i) => {
            const r = Math.floor(i / cols);
            const inRow = r === rows - 1 ? count - r * cols : cols;
            const c = i - r * cols;
            const rowOffset = ((cols - inRow) * cell) / 2;
            const p = pxToWorld(x0 + c * cell + rowOffset, y0 + r * cell, 0);
            const n = halfW > 0 ? p.x / halfW : 0;
            const curve = view.portrait ? 0.35 : 1.6;
            p.z = -curve * n * n;
            tile.L.pos.copy(p);
            tile.L.rot.set(0, (view.portrait ? -0.06 : -0.2) * n, 0);
            tile.L.s = cellWorld * 0.8;
        });
    }

    function measureMarks() {
        const y = window.scrollY;
        const heroTop = hero.getBoundingClientRect().top + y;
        const numbersTop = numbers.getBoundingClientRect().top + y;
        const wallTop = wall.getBoundingClientRect().top + y;
        marks.formStart = heroTop + view.h * 0.12;
        marks.formEnd = Math.max(marks.formStart + 1, numbersTop);
        marks.holdEnd = Math.max(marks.formEnd + 1, numbersTop + numbers.offsetHeight - view.h);
        marks.wallEnd = Math.max(marks.holdEnd + 1, wallTop);
    }

    function resize() {
        const w = canvas.clientWidth || window.innerWidth;
        const h = canvas.clientHeight || window.innerHeight;
        view.w = w;
        view.h = h;
        view.portrait = w / h < 0.9;
        view.visH = 2 * Math.tan((FOV * Math.PI) / 360) * CAM_Z;
        view.visW = view.visH * (w / h);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        layoutScatter();
        layoutForm();
        layoutWall();
        measureMarks();
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
        const hit = raycaster.intersectObjects(meshes, false)[0];
        return hit ? hit.object.userData.index : -1;
    }

    function linkTarget(project) {
        const url = W.getStoreUrl(project);
        return { url, external: url !== project.detail };
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
        if (touchLike) {
            pointer.touch = true;
            if (index >= 0 && index === selected) {
                W.openProject(tiles[index].project);
                return;
            }
            selected = index;
            requestRender();
            return;
        }
        if (index >= 0) W.openProject(tiles[index].project);
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
        const tile = tiles[index];
        if (labelIndex !== index) {
            labelIndex = index;
            const project = tile.project;
            labelName.textContent = project.title;
            labelMeta.textContent = `${project.year} · ${platformText(project)}`;
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

    // ---------- 움직임 ----------
    let reduced = motionQuery.matches;
    let stageVisible = true;
    let running = false;
    let frameRequested = false;
    let last = performance.now();
    const start = performance.now();
    const introFrom = new Vector3();
    const target = new Vector3();
    const targetRot = new Vector3();
    const tmp = new Vector3();

    function mixes() {
        const y = window.scrollY;
        const a = clamp01((y - marks.formStart) / (marks.formEnd - marks.formStart));
        const b = clamp01((y - marks.holdEnd) / (marks.wallEnd - marks.holdEnd));
        return { a, b };
    }

    function step(now) {
        const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
        last = now;
        const time = (now - start) / 1000;
        let { a, b } = mixes();
        if (reduced) {
            // 움직임 줄이기: 구간마다 정지 배치만 보여 준다(사이를 잇는 움직임 없음).
            const y = window.scrollY;
            a = y > (marks.formStart + marks.formEnd) / 2 ? 1 : 0;
            b = y > (marks.holdEnd + marks.wallEnd) / 2 ? 1 : 0;
        }

        // 마우스는 매 프레임 다시 고르고, 터치는 누른 타일을 유지한다.
        if (!pointer.touch && pointer.inside && finePointerQuery.matches && stageVisible) {
            hovered = pick(pointer.x, pointer.y);
        } else if (!pointer.touch) {
            hovered = -1;
        }
        const active = pointer.touch ? selected : hovered;

        if (!reduced) {
            camera.position.x += ((pointer.inside ? pointer.nx * 0.45 : 0) - camera.position.x) * (1 - Math.exp(-dt * 3));
            camera.position.y += ((pointer.inside ? pointer.ny * 0.3 : 0) - camera.position.y) * (1 - Math.exp(-dt * 3));
            camera.lookAt(0, 0, 0);
        }
        camera.updateMatrixWorld();

        const pushRadius = Math.max(110, Math.min(190, view.w * 0.12));
        const stiffness = 70;
        const damping = 2 * Math.sqrt(stiffness) * 0.78;
        const rotEase = 1 - Math.exp(-dt * 8);
        const hoverEase = 1 - Math.exp(-dt * 12);

        tiles.forEach((tile, i) => {
            const ta = reduced ? a : easeInOut(clamp01((a - tile.delay) / 0.7));
            const tb = reduced ? b : easeInOut(clamp01((b - tile.delay2) / 0.7));
            target.copy(tile.S.pos).lerp(tile.F.pos, ta).lerp(tile.L.pos, tb);
            targetRot.copy(tile.S.rot).lerp(tile.F.rot, ta).lerp(tile.L.rot, tb);
            let s = lerp(lerp(tile.S.s, tile.F.s, ta), tile.L.s, tb);

            if (!reduced) {
                const calm = (1 - ta) * (1 - tb);
                target.y += Math.sin(time * 0.55 * tile.bob + tile.phase) * 0.22 * calm;
                target.x += Math.cos(time * 0.4 * tile.bob + tile.phase) * 0.12 * calm;
                targetRot.x += Math.sin(time * 0.5 + tile.phase) * 0.08 * calm;
                targetRot.y += Math.cos(time * 0.45 + tile.phase) * 0.1 * calm;
                const flight = Math.sin(Math.PI * ta) + Math.sin(Math.PI * tb);
                targetRot.y += flight * tile.spin;
                targetRot.x += flight * tile.spinX;
                target.z += flight * 1.6;

                // 첫 화면 등장: 멀리서 차례로 날아온다.
                const intro = clamp01((time - 0.15 - tile.introDelay * 0.9) / 0.6);
                if (intro <= 0) {
                    introFrom.set(tile.S.pos.x * 1.8, tile.S.pos.y * 1.8, -55);
                    target.copy(introFrom);
                }

                // 커서 근처 타일은 밀리고 기운다.
                tile.push.set(0, 0, 0);
                tile.tilt.set(0, 0);
                if (pointer.inside && !pointer.touch && finePointerQuery.matches) {
                    const dx = tile.screen.x - pointer.x;
                    const dy = tile.screen.y - pointer.y;
                    const d = Math.hypot(dx, dy);
                    if (d < pushRadius && d > 0.001 && i !== active) {
                        const f = Math.pow(1 - d / pushRadius, 2);
                        const unit = worldPerPx(tile.pos.z) * 26;
                        tile.push.set((dx / d) * f * unit, -(dy / d) * f * unit, -f * s * 0.5);
                        tile.tilt.set((dy / d) * f * 0.55, (dx / d) * f * 0.55);
                    }
                }
                target.add(tile.push);
                targetRot.x += tile.tilt.x;
                targetRot.y += tile.tilt.y;
            }

            tile.hover += ((i === active ? 1 : 0) - tile.hover) * (reduced ? 1 : hoverEase);
            if (tile.hover > 0.001) {
                target.z += tile.hover * Math.max(1.2, s * 1.6);
                targetRot.multiplyScalar(1 - tile.hover * 0.85);
                s *= 1 + tile.hover * 0.18;
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
            projected.copy(tile.pos).project(camera);
            tile.screen.set((projected.x * 0.5 + 0.5) * view.w, (-projected.y * 0.5 + 0.5) * view.h);
        });

        renderer.render(scene, camera);
        updateLabel(active);
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
    const y0 = window.scrollY;
    tiles.forEach((tile) => {
        tile.scale = tile.S.s;
        if (reduced || y0 > marks.formStart) {
            const { a, b } = mixes();
            tile.pos.copy(tile.S.pos).lerp(tile.F.pos, a).lerp(tile.L.pos, b);
            tile.scale = lerp(lerp(tile.S.s, tile.F.s, a), tile.L.s, b);
            tile.introDelay = -1;
        } else {
            tile.pos.set(tile.S.pos.x * 1.8, tile.S.pos.y * 1.8, -55);
        }
    });

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
            layoutScatter();
            layoutForm();
            layoutWall();
            measureMarks();
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
    window.__wonScene = { tiles, marks, view, get loaded() { return loaded; }, get running() { return running; }, get frames() { return frameCount; } };
    startLoop();
    requestRender();
}

try {
    init();
} catch (error) {
    console.warn("WebGL scene disabled:", error);
    showFallback();
}
