// 첫 화면 배경 세 판. home.js가 주소의 ?bg=a|b|c로 고른다(없으면 home.js의 기본값).
//   a 흑요석 블록: 광택 나는 검은 돌 블록 수백 개가 느린 너울로 오르내린다. 빨간 가는 선 하나가 블록 사이를 가로지른다.
//   b 거울 돌 바닥 홀: 반사되는 검은 돌 바닥 위로 흑철 석판이 두 줄로 서서 천천히 다가온다. 끝에 빨간 가는 선 하나.
//   c 검은 수면: 끝없는 검은 물이 느리고 무거운 너울로 움직이며 스튜디오 빛을 받아 은은히 빛난다. 멀리 빨간 부표 불빛 하나.
// 반사에 쓰는 주변 환경도 여기서 만든다: 어두운 방 + 흰 소프트박스 몇 개(studioEnvironment).
// 색은 #080808 · #121212 · #282828 · #FFFFFF · #EF1D2D만 쓴다. 나머지 밝기 차이는 모두 조명 · 반사 · 거리에 따른 빛의 감쇠다.
import {
    BackSide,
    BoxGeometry,
    BufferGeometry,
    Color,
    DoubleSide,
    Float32BufferAttribute,
    Fog,
    Group,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    Plane,
    PlaneGeometry,
    PMREMGenerator,
    Raycaster,
    Reflector,
    Scene,
    SphereGeometry,
    Vector2,
    Vector3,
    Vector4,
} from "./lib/three-0.186.1.min.js";

const BG = 0x080808;
const RED = 0xef1d2d;

export const BACKGROUND_NAMES = {
    a: "흑요석 블록",
    b: "거울 돌 바닥 홀",
    c: "검은 수면",
};

export function createBackground(kind, ctx) {
    if (kind === "a") return obsidianField(ctx);
    if (kind === "c") return blackWater(ctx);
    return mirrorHall(ctx);
}

// 반사용 환경: 어두운 방(#121212)에 흰 소프트박스 · 가는 띠 조명. 검은 재질이 회색으로 뜨지 않고
// 모서리 · 물결에만 빛이 맺히게 한다(제품 사진 스튜디오처럼).
export function studioEnvironment(renderer) {
    const env = new Scene();
    const room = new Mesh(new BoxGeometry(40, 24, 40), new MeshBasicMaterial({ color: 0x121212, side: BackSide }));
    env.add(room);
    const panel = (w, h, intensity, position, rotation) => {
        const material = new MeshBasicMaterial({ color: new Color(1, 1, 1).multiplyScalar(intensity), side: DoubleSide });
        const mesh = new Mesh(new PlaneGeometry(w, h), material);
        mesh.position.set(...position);
        mesh.rotation.set(...rotation);
        env.add(mesh);
    };
    panel(16, 9, 2.4, [0, 11.6, -3], [Math.PI / 2, 0, 0]); // 위 소프트박스
    panel(1.4, 14, 3.2, [-19.6, 2, -4], [0, Math.PI / 2, 0]); // 왼쪽 띠
    panel(0.8, 14, 1.6, [19.6, 2, -7], [0, -Math.PI / 2, 0]); // 오른쪽 띠(약하게)
    panel(30, 0.9, 2.2, [0, 0.8, -19.6], [0, 0, 0]); // 먼 벽 가로 띠(물 · 바닥에 비친다)
    panel(1.1, 11, 2.0, [-5.5, 6.5, -19.5], [0, 0, 0]); // 먼 벽 세로 띠 둘(물결 · 돌 윗면에 가늘게 맺힌다)
    panel(1.1, 11, 2.0, [5.5, 6.5, -19.5], [0, 0, 0]);
    const pmrem = new PMREMGenerator(renderer);
    const texture = pmrem.fromScene(env, 0.015).texture;
    pmrem.dispose();
    env.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) obj.material.dispose();
    });
    return texture;
}

const lerp = (a, b, t) => a + (b - a) * t;
const ease = (rate, dt) => 1 - Math.exp(-rate * dt);

// 바닥을 기울여 카메라가 내려다보는 것처럼 만든다(타일 배치 계산은 카메라 그대로 두기 위해).
// 그룹 안에서 바닥은 y = 0 평면이고, 카메라는 그룹 좌표 (0, height, 0)에 있다.
function groundFrame(group, pitch, height, camZ) {
    group.rotation.set(pitch, 0, 0);
    group.position.set(0, -height * Math.cos(pitch), camZ - height * Math.sin(pitch));
    group.updateMatrixWorld(true);
}

function baseCamera(ctx) {
    const cam = ctx.camera.clone();
    cam.position.set(0, 0, ctx.CAM_Z);
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld(true);
    return cam;
}

// 화면 네 귀퉁이에서 나간 시선이 바닥(그룹의 y = 0)과 만나는 범위를 그룹 좌표로 돌려준다.
function footprint(ctx, group, maxDist) {
    const cam = baseCamera(ctx);
    const normal = new Vector3(0, 1, 0).applyQuaternion(group.quaternion);
    const inv = group.matrixWorld.clone().invert();
    const box = { minX: Infinity, maxX: -Infinity, minZ: Infinity, maxZ: -Infinity };
    for (const [x, y] of [[-1, -1], [1, -1], [1, 1], [-1, 1], [0, 1], [0, -1]]) {
        const dir = new Vector3(x, y, 0.5).unproject(cam).sub(cam.position).normalize();
        const denom = normal.dot(dir);
        let t = denom < -1e-4 ? normal.dot(group.position.clone().sub(cam.position)) / denom : maxDist;
        if (!(t > 0) || t > maxDist) t = maxDist;
        const p = cam.position.clone().addScaledVector(dir, t).applyMatrix4(inv);
        box.minX = Math.min(box.minX, p.x);
        box.maxX = Math.max(box.maxX, p.x);
        box.minZ = Math.min(box.minZ, p.z);
        box.maxZ = Math.max(box.maxZ, p.z);
    }
    return box;
}

function pointerRay(ctx, nx, ny) {
    const raycaster = ctx._raycaster || (ctx._raycaster = new Raycaster());
    raycaster.setFromCamera(new Vector2(nx, ny), ctx.camera);
    return raycaster.ray;
}

// ---------------------------------------------------------------- a
function obsidianField(ctx) {
    const { scene, envMap, lowPower, CAM_Z } = ctx;
    const PITCH = 0.5;
    const HEIGHT = 34;
    const group = new Group();
    groundFrame(group, PITCH, HEIGHT, CAM_Z);
    scene.add(group);
    scene.fog = new Fog(BG, 62, 150);

    const cap = lowPower ? 520 : 1100;
    const geometry = new BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    const uniforms = {
        uPhase: { value: 0 },
        uAmp: { value: 1 },
        uTime: { value: 0 },
        uDip: { value: new Vector3() },
        uRip: { value: [new Vector4(), new Vector4(), new Vector4()] },
    };
    // 광택 나는 검은 돌: 바탕색은 #121212, 나머지 밝기는 주광 반사와 주변 반사(envMap)에서 온다.
    const material = new MeshStandardMaterial({ color: 0x121212, roughness: 0.04, metalness: 0, envMap, envMapIntensity: 0.7 });
    // 바닥을 기울인 만큼 주변 환경도 같이 돌린다: 윗면에는 천장 조명이 아니라 먼 벽의 가는 띠 조명만 비친다.
    material.envMapRotation.set(PITCH, 0, 0);
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>
uniform float uPhase;
uniform float uAmp;
uniform float uTime;
uniform vec3 uDip;
uniform vec4 uRip[3];
float fieldHeight(vec2 p) {
    float t = uPhase;
    float w = sin(p.x * 0.15 + t * 0.9) * 0.5
        + sin(p.y * 0.19 - t * 0.7 + p.x * 0.04) * 0.45
        + sin((p.x - p.y) * 0.09 + t * 0.5) * 0.55;
    w = clamp(0.5 + w / 3.0, 0.0, 1.0);
    float h = 0.8 + uAmp * 5.2 * w * w;
    float d = distance(p, uDip.xy);
    h -= uDip.z * 1.8 * exp(-d * d * 0.012);
    for (int i = 0; i < 3; i++) {
        vec4 r = uRip[i];
        float age = uTime - r.z;
        if (r.w > 0.0 && age > 0.0 && age < 9.0) {
            float k = (distance(p, r.xy) - age * 3.2) * 0.32;
            h += exp(-k * k) * r.w * 1.6 * exp(-age * 0.4);
        }
    }
    return max(h, 0.3);
}`)
            .replace("#include <begin_vertex>", `#include <begin_vertex>
    float fieldH = fieldHeight(vec2(instanceMatrix[3].x, instanceMatrix[3].z));
    vCrest = clamp((fieldH - 0.8) / 5.2, 0.0, 1.0) * step(0.5, normal.y);
    transformed.y *= fieldH;`)
            .replace("void main() {", "varying float vCrest;\nvoid main() {");
        // 기둥 위에 낮게 걸린 흰 조명: 높이 솟은 기둥 머리일수록 빛을 더 받는다(물결 모양이 빛으로 보인다).
        shader.fragmentShader = shader.fragmentShader
            .replace("void main() {", "varying float vCrest;\nvoid main() {")
            .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n    totalEmissiveRadiance += vec3(0.03) * vCrest * vCrest;");
    };
    const mesh = new InstancedMesh(geometry, material, cap);
    mesh.frustumCulled = false;
    group.add(mesh);

    // 빨간 가는 선 하나: 기둥 위를 가로질러 떠 있고, 높이 솟은 기둥이 지나가며 선을 가린다.
    const line = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: RED, fog: false }));
    group.add(line);

    const state = { phase: 7, amp: 1, dip: new Vector3(), dipOn: 0, rip: 0, lineZ: -40, lineBase: -40 };
    const planeWorld = new Plane();
    const hit = new Vector3();
    const m = new Matrix4();

    function localOnField(nx, ny) {
        const ray = pointerRay(ctx, nx, ny);
        planeWorld.setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0).applyQuaternion(group.quaternion), group.position);
        if (!ray.intersectPlane(planeWorld, hit)) return null;
        return group.worldToLocal(hit.clone());
    }

    return {
        kind: "a",
        resize() {
            const box = footprint(ctx, group, 150);
            const width = box.maxX - box.minX;
            const depth = box.maxZ - box.minZ;
            const marginX = width * 0.08 + 2;
            const marginZ = depth * 0.04 + 2;
            const area = (width + marginX * 2) * (depth + marginZ * 2) * 0.72;
            const cell = Math.max(1.9, Math.sqrt(area / cap));
            const cam = baseCamera(ctx);
            const inv = group.matrixWorld.clone().invert();
            const camLocal = cam.position.clone().applyMatrix4(inv);
            const tanH = Math.tan((cam.fov * Math.PI) / 360) * cam.aspect;
            let n = 0;
            for (let z = box.maxZ + marginZ; z > box.minZ - marginZ && n < cap; z -= cell) {
                // 줄마다 화면에 보이는 폭만큼만 놓는다(사다리꼴).
                const dist = Math.hypot(camLocal.y, camLocal.z - z);
                const half = dist * tanH * 1.18 + 2;
                for (let x = -half; x <= half && n < cap; x += cell) {
                    m.makeScale(cell * 0.955, 1, cell * 0.955);
                    m.setPosition(x + cell / 2, 0, z);
                    mesh.setMatrixAt(n, m);
                    n += 1;
                }
            }
            mesh.count = n;
            mesh.instanceMatrix.needsUpdate = true;
            state.lineBase = lerp(box.maxZ, box.minZ, 0.36);
            state.lineZ = state.lineBase;
            line.scale.set(width * 2 + 20, 0.08, 0.08);
            line.position.set(0, 4.6, state.lineZ);
            ctx.debug.cells = n;
            ctx.debug.cell = cell;
        },
        poke(nx, ny) {
            const p = localOnField(nx, ny);
            if (!p) return;
            const r = uniforms.uRip.value[state.rip % 3];
            r.set(p.x, p.z, uniforms.uTime.value, 1);
            state.rip += 1;
        },
        update(s) {
            uniforms.uTime.value = s.time;
            const targetAmp = lerp(lerp(1, 0.2, s.a), 0.5, s.b) + s.energy * 0.25;
            if (s.reduced) {
                state.phase = 7;
                state.amp = targetAmp;
                state.dipOn = 0;
            } else {
                state.phase += s.dt * 0.5 * (1 + s.energy * 1.4);
                state.amp += (targetAmp - state.amp) * ease(0.9, s.dt);
                const p = s.pointer.inside && s.pointer.fine ? localOnField(s.pointer.nx, s.pointer.ny) : null;
                if (p) state.dip.lerp(new Vector3(p.x, p.z, 0), ease(1.6, s.dt));
                state.dipOn += ((p ? 1 : 0) - state.dipOn) * ease(0.8, s.dt);
                // 선은 아주 천천히 앞뒤로 흐른다.
                state.lineZ = state.lineBase + Math.sin(s.time * 0.05) * 3;
            }
            uniforms.uPhase.value = state.phase;
            uniforms.uAmp.value = state.amp;
            uniforms.uDip.value.set(state.dip.x, state.dip.y, state.dipOn);
            line.position.z = state.lineZ;
        },
    };
}

// ---------------------------------------------------------------- b
const FLOOR_SHADER = {
    name: "PolishedStoneFloor",
    uniforms: {
        color: { value: null },
        tDiffuse: { value: null },
        textureMatrix: { value: null },
        uBase: { value: new Color(BG) },
        uSeam: { value: new Color(0x121212) },
        uTexel: { value: new Vector2(1 / 512, 1 / 512) },
        uStrength: { value: 0.42 },
        uNear: { value: 60 },
        uFar: { value: 260 },
    },
    vertexShader: /* glsl */`
        uniform mat4 textureMatrix;
        varying vec4 vUv;
        varying vec2 vPlane;
        varying float vDepth;
        void main() {
            vUv = textureMatrix * vec4(position, 1.0);
            vPlane = position.xy;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vDepth = -mv.z;
            gl_Position = projectionMatrix * mv;
        }`,
    fragmentShader: /* glsl */`
        uniform vec3 color;
        uniform sampler2D tDiffuse;
        uniform vec3 uBase;
        uniform vec3 uSeam;
        uniform vec2 uTexel;
        uniform float uStrength;
        uniform float uNear;
        uniform float uFar;
        varying vec4 vUv;
        varying vec2 vPlane;
        varying float vDepth;
        void main() {
            vec2 uv = vUv.xy / vUv.w;
            // 살짝 무뎌진 반사(닦은 돌): 가운데와 네 이웃을 섞는다.
            vec3 r = texture2D(tDiffuse, uv).rgb * 0.36;
            r += texture2D(tDiffuse, uv + vec2(uTexel.x, 0.0)).rgb * 0.16;
            r += texture2D(tDiffuse, uv - vec2(uTexel.x, 0.0)).rgb * 0.16;
            r += texture2D(tDiffuse, uv + vec2(0.0, uTexel.y * 2.0)).rgb * 0.16;
            r += texture2D(tDiffuse, uv - vec2(0.0, uTexel.y * 2.0)).rgb * 0.16;
            // 돌의 결: 반사 세기가 아주 조금씩 달라진다.
            float vein = 0.86 + 0.14 * sin(vPlane.x * 0.55 + sin(vPlane.y * 0.21) * 2.4 + sin(vPlane.y * 0.07) * 3.0);
            vec3 col = uBase + r * uStrength * vein;
            // 큰 판석 이음매(#121212, 가는 선)
            vec2 cell = abs(fract(vPlane / 12.0 + 0.5) - 0.5) * 12.0;
            float dist = min(cell.x, cell.y);
            float w = fwidth(dist) * 1.2;
            float seam = 1.0 - smoothstep(0.0, w, dist);
            col = mix(col, uSeam, seam * 0.85);
            // 멀수록 빛이 닿지 않는다.
            col = mix(col, uBase, smoothstep(uNear, uFar, vDepth));
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
        }`,
};

function mirrorHall(ctx) {
    const { scene, envMap, lowPower, CAM_Z } = ctx;
    const PITCH = 0.1;
    const HEIGHT = 12;
    const group = new Group();
    groundFrame(group, PITCH, HEIGHT, CAM_Z);
    scene.add(group);
    scene.fog = new Fog(BG, 70, 300);

    const reflector = new Reflector(new PlaneGeometry(240, 560), {
        textureWidth: 512,
        textureHeight: 512,
        clipBias: 0.002,
        multisample: lowPower ? 0 : 4,
        shader: FLOOR_SHADER,
    });
    reflector.rotation.x = -Math.PI / 2;
    reflector.position.set(0, 0, -250);
    group.add(reflector);
    const floorUniforms = reflector.material.uniforms;
    floorUniforms.uBase.value = new Color(BG);
    floorUniforms.uSeam.value = new Color(0x121212);

    // 흑철 석판: 무채색 금속, 은은한 주변 반사.
    const SLABS = 40;
    const LENGTH = 360;
    const geometry = new BoxGeometry(1, 1, 1);
    geometry.translate(0, 0.5, 0);
    const material = new MeshStandardMaterial({ color: 0x121212, metalness: 0.8, roughness: 0.28, envMap, envMapIntensity: 0.85 });
    const slabs = new InstancedMesh(geometry, material, SLABS);
    slabs.frustumCulled = false;
    group.add(slabs);
    const rnd = (() => {
        let a = 1931;
        return () => {
            a = (a * 16807) % 2147483647;
            return (a - 1) / 2147483646;
        };
    })();
    const slabData = [];
    for (let i = 0; i < SLABS; i += 1) {
        const side = i % 2 === 0 ? -1 : 1;
        const k = Math.floor(i / 2);
        slabData.push({
            side,
            z: -10 - k * (LENGTH / (SLABS / 2)) - (side > 0 ? 9 : 0),
            width: 2.6 + rnd() * 2.2,
            height: 20 + rnd() * 22,
            depth: 0.9,
            jitter: rnd() * 2.2,
            turn: (rnd() - 0.5) * 0.18,
        });
    }

    // 빨간 가는 선 하나: 홀 끝, 눈높이(지평선)에 떠 있고 바닥에 비친다.
    const line = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: RED, fog: false }));
    line.position.set(0, HEIGHT, -290);
    line.scale.set(30, 0.24, 0.24);
    group.add(line);

    const state = { speed: 1.4, rowX: 11, scaleW: 1 };
    const m = new Matrix4();
    const turn = new Matrix4();
    const tmpPos = new Vector3();

    function placeSlabs() {
        slabData.forEach((slab, i) => {
            turn.makeRotationY(slab.turn * slab.side);
            m.makeScale(slab.width * state.scaleW, slab.height, slab.depth);
            m.premultiply(turn);
            tmpPos.set(slab.side * (state.rowX + slab.jitter * state.scaleW), 0, slab.z);
            m.setPosition(tmpPos);
            slabs.setMatrixAt(i, m);
        });
        slabs.instanceMatrix.needsUpdate = true;
    }

    return {
        kind: "b",
        resize() {
            const { w, h } = ctx.view;
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const scale = lowPower ? 0.42 : 0.5;
            const tw = Math.max(256, Math.round(w * dpr * scale));
            const th = Math.max(256, Math.round(h * dpr * scale));
            reflector.getRenderTarget().setSize(tw, th);
            floorUniforms.uTexel.value.set(1 / tw, 1 / th);
            const portrait = w / h < 0.9;
            state.rowX = portrait ? 4.6 : 11;
            state.scaleW = portrait ? 0.62 : 1;
            line.scale.x = portrait ? 12 : 30;
            placeSlabs();
        },
        poke() {},
        update(s) {
            const target = lerp(lerp(1.4, 0.5, s.a), 0.9, s.b) * (1 + s.energy * 2.5);
            if (s.reduced) {
                state.speed = 0;
            } else {
                state.speed += (target - state.speed) * ease(1.2, s.dt);
            }
            const dz = state.speed * s.dt;
            if (dz) {
                for (const slab of slabData) {
                    slab.z += dz;
                    if (slab.z > -6) slab.z -= LENGTH;
                }
                placeSlabs();
            }
        },
    };
}

// ---------------------------------------------------------------- c
function blackWater(ctx) {
    const { scene, envMap, lowPower, CAM_Z } = ctx;
    const PITCH = 0.2;
    const HEIGHT = 18;
    const group = new Group();
    groundFrame(group, PITCH, HEIGHT, CAM_Z);
    scene.add(group);
    scene.fog = new Fog(BG, 90, 520);

    // 화면에서 고르게 보이도록, 가까운 곳은 촘촘하고 먼 곳은 성긴 사다리꼴 격자.
    const rows = lowPower ? 120 : 190;
    const cols = lowPower ? 110 : 210;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(new Float32Array((rows + 1) * (cols + 1) * 3), 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(new Float32Array((rows + 1) * (cols + 1) * 3), 3));
    const index = [];
    for (let i = 0; i < rows; i += 1) {
        for (let j = 0; j < cols; j += 1) {
            const a = i * (cols + 1) + j;
            const b = a + cols + 1;
            index.push(a, a + 1, b, b, a + 1, b + 1);
        }
    }
    geometry.setIndex(index);

    const uniforms = {
        uPhase: { value: 0 },
        uAmp: { value: 1 },
        uTime: { value: 0 },
        uRip: { value: [new Vector4(), new Vector4(), new Vector4(), new Vector4()] },
    };
    const waveGLSL = `
uniform float uPhase;
uniform float uAmp;
uniform float uTime;
uniform vec4 uRip[4];
float waterHeight(vec2 p) {
    float t = uPhase;
    float h = sin(dot(p, vec2(0.82, 0.57)) * 0.11 + t * 0.62) * 0.62
        + sin(dot(p, vec2(-0.45, 0.89)) * 0.17 - t * 0.81) * 0.34
        + sin(dot(p, vec2(0.21, -0.98)) * 0.29 + t * 1.07) * 0.16
        + sin(dot(p, vec2(-0.93, -0.36)) * 0.47 + t * 1.38) * 0.07;
    h *= uAmp;
    for (int i = 0; i < 4; i++) {
        vec4 r = uRip[i];
        float age = uTime - r.z;
        if (r.w > 0.0 && age > 0.0 && age < 12.0) {
            float k = distance(p, r.xy) - age * 2.2;
            h += cos(k * 0.9) * exp(-k * k * 0.05) * r.w * 0.45 * exp(-age * 0.32);
        }
    }
    return h;
}`;
    const material = new MeshStandardMaterial({ color: 0x080808, roughness: 0.06, metalness: 0, envMap, envMapIntensity: 0.36 });
    material.envMapRotation.set(PITCH, 0, 0);
    material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>${waveGLSL}
varying vec2 vWaterP;
varying vec3 vWaterT;
varying vec3 vWaterB;
varying float vWaterDepth;`)
            .replace("#include <project_vertex>", `#include <project_vertex>
    vWaterP = position.xz;
    vWaterT = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
    vWaterB = normalize(normalMatrix * vec3(0.0, 0.0, 1.0));
    vWaterDepth = -mvPosition.z;`)
            .replace("#include <beginnormal_vertex>", `float wE = 0.35;
    float wH = waterHeight(position.xz);
    float wX = waterHeight(position.xz + vec2(wE, 0.0));
    float wZ = waterHeight(position.xz + vec2(0.0, wE));
    vec3 objectNormal = normalize(vec3(-(wX - wH) / wE, 1.0, -(wZ - wH) / wE));`)
            .replace("#include <begin_vertex>", `#include <begin_vertex>
    transformed.y += wH;`);
        // 잔물결은 픽셀에서 법선만 흔든다: 빛이 잘게 부서져 맺힌다(멀수록 약하게).
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>
uniform float uPhase;
varying vec2 vWaterP;
varying vec3 vWaterT;
varying vec3 vWaterB;
varying float vWaterDepth;`)
            .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
    {
        float t = uPhase;
        vec2 p = vWaterP;
        vec2 g = 0.03 * 0.9 * vec2(0.6, 0.8) * cos(dot(p, vec2(0.6, 0.8)) * 0.9 + t * 1.9)
            + 0.02 * 1.7 * vec2(-0.8, 0.6) * cos(dot(p, vec2(-0.8, 0.6)) * 1.7 - t * 2.3)
            + 0.011 * 2.9 * vec2(0.28, -0.96) * cos(dot(p, vec2(0.28, -0.96)) * 2.9 + t * 2.8);
        g *= 1.0 - smoothstep(34.0, 120.0, vWaterDepth);
        normal = normalize(normal - g.x * vWaterT - g.y * vWaterB);
    }`);
    };
    const water = new Mesh(geometry, material);
    water.frustumCulled = false;
    group.add(water);

    // 멀리 떠 있는 빨간 부표 불빛 하나(작은 점).
    const buoy = new Mesh(new SphereGeometry(0.42, 18, 12), new MeshBasicMaterial({ color: RED, fog: false }));
    group.add(buoy);
    const buoySpot = new Vector3(-26, 0, -150);

    const jsHeight = (x, z) => {
        const t = uniforms.uPhase.value;
        const h = Math.sin((x * 0.82 + z * 0.57) * 0.11 + t * 0.62) * 0.62
            + Math.sin((x * -0.45 + z * 0.89) * 0.17 - t * 0.81) * 0.34
            + Math.sin((x * 0.21 - z * 0.98) * 0.29 + t * 1.07) * 0.16
            + Math.sin((x * -0.93 - z * 0.36) * 0.47 + t * 1.38) * 0.07;
        return h * uniforms.uAmp.value;
    };

    const state = { phase: 3, amp: 1, rip: 0, lastRipple: -10, lastX: 0, lastY: 0 };
    const planeWorld = new Plane();
    const hit = new Vector3();
    function localOnWater(nx, ny) {
        const ray = pointerRay(ctx, nx, ny);
        planeWorld.setFromNormalAndCoplanarPoint(new Vector3(0, 1, 0).applyQuaternion(group.quaternion), group.position);
        if (!ray.intersectPlane(planeWorld, hit)) return null;
        const p = group.worldToLocal(hit.clone());
        return p.z < -20 ? p : null;
    }
    function addRipple(p, strength) {
        uniforms.uRip.value[state.rip % 4].set(p.x, p.z, uniforms.uTime.value, strength);
        state.rip += 1;
    }

    return {
        kind: "c",
        resize() {
            const cam = baseCamera(ctx);
            const tanH = Math.tan((cam.fov * Math.PI) / 360) * cam.aspect;
            const near = -HEIGHT / Math.tan(PITCH + (cam.fov * Math.PI) / 360) + 6;
            const far = -560;
            const pos = geometry.attributes.position.array;
            const nor = geometry.attributes.normal.array;
            let k = 0;
            for (let i = 0; i <= rows; i += 1) {
                const f = Math.pow(i / rows, 2.1);
                const z = near + (far - near) * f;
                const half = Math.hypot(HEIGHT, z) * tanH * 1.25 + 6;
                for (let j = 0; j <= cols; j += 1) {
                    pos[k] = (j / cols - 0.5) * half * 2;
                    pos[k + 1] = 0;
                    pos[k + 2] = z;
                    nor[k] = 0;
                    nor[k + 1] = 1;
                    nor[k + 2] = 0;
                    k += 3;
                }
            }
            geometry.attributes.position.needsUpdate = true;
            geometry.attributes.normal.needsUpdate = true;
            geometry.computeBoundingSphere();
            const portrait = ctx.view.w / ctx.view.h < 0.9;
            buoySpot.set(portrait ? -7 : -26, 0, -150);
            ctx.debug.cells = rows * cols;
        },
        poke(nx, ny) {
            const p = localOnWater(nx, ny);
            if (p) addRipple(p, 1);
        },
        update(s) {
            uniforms.uTime.value = s.time;
            const targetAmp = lerp(lerp(1, 0.35, s.a), 0.6, s.b) + s.energy * 0.35;
            if (s.reduced) {
                state.phase = 3;
                state.amp = targetAmp;
            } else {
                state.phase += s.dt * 0.55 * (1 + s.energy * 1.2);
                state.amp += (targetAmp - state.amp) * ease(0.8, s.dt);
                // 커서가 물 위를 지나가면 느린 물결을 남긴다(1.4초에 하나).
                const moved = Math.hypot(s.pointer.x - state.lastX, s.pointer.y - state.lastY) > 24;
                if (s.pointer.inside && s.pointer.fine && moved && s.time - state.lastRipple > 1.4) {
                    const p = localOnWater(s.pointer.nx, s.pointer.ny);
                    if (p) {
                        addRipple(p, 0.55);
                        state.lastRipple = s.time;
                        state.lastX = s.pointer.x;
                        state.lastY = s.pointer.y;
                    }
                }
            }
            uniforms.uPhase.value = state.phase;
            uniforms.uAmp.value = state.amp;
            buoy.position.set(buoySpot.x, jsHeight(buoySpot.x, buoySpot.z) + 0.35, buoySpot.z);
        },
    };
}
