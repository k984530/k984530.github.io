// won-space.com 첫 화면의 무대(배경 · 빛 · 후처리).
// 판 두 개를 ?bg=1 · ?bg=2 로 고른다.
//   1 제품 공개 스튜디오: 광택 현무암 바닥 위에 아이콘 타일이 줄지어 서 있고, 긴 띠 조명이 천천히 오가며 앞면과 모서리를 쓸고 지나간다.
//   2 검은 액체 금속: 화면 뒤를 채우는 검은 거울 액체가 아주 느리게 일렁이고, 그 위에 떠 있는 타일이 수면에 비친다.
// 빛은 판마다 무채색 스튜디오 환경광(흰 빛 판 + PMREM) 하나에서 나온다. 블룸 · 후광 · 비네트 · 색 번짐은 쓰지 않는다.
import {
    BackSide,
    BoxGeometry,
    BufferGeometry,
    Color,
    Float32BufferAttribute,
    Fog,
    HalfFloatType,
    InstancedMesh,
    LinearFilter,
    LinearMipmapLinearFilter,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshDepthMaterial,
    MeshPhysicalMaterial,
    NearestFilter,
    NoBlending,
    OrthographicCamera,
    PerspectiveCamera,
    PlaneGeometry,
    PMREMGenerator,
    RGBADepthPacking,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderTarget,
    Pass,
    FullScreenQuad,
} from "./lib/three-0.186.1.min.js?v=20261122e";

export const STAGE_NAMES = { 1: "제품 공개 스튜디오", 2: "검은 액체 금속" };

const BLACK = 0x080808;

// ---------- 공통 GLSL ----------

const NOISE_GLSL = /* glsl */ `
float stHash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
}
float stNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(stHash(i), stHash(i + vec2(1.0, 0.0)), u.x), mix(stHash(i + vec2(0.0, 1.0)), stHash(i + vec2(1.0, 1.0)), u.x), u.y);
}
`;

// 바닥 · 수면에 비친 타일(평면 반사)을 밉맵 두 단계로 읽는다.
// 반사 텍스처의 알파는 「바닥에서 가까운 정도」라서, 닿은 곳은 또렷하고 위로 갈수록 흐려진다.
const MIRROR_GLSL = /* glsl */ `
uniform sampler2D tMirror;
uniform vec2 uMirrorTexel;
uniform vec2 uMirrorLod;
vec4 readMirrorLod(vec2 uv, float lod) {
    vec2 d = uMirrorTexel * exp2(lod) * 0.9;
    vec4 c = textureLod(tMirror, uv, lod) * 0.36;
    c += textureLod(tMirror, uv + vec2(d.x, d.y * 0.4), lod) * 0.16;
    c += textureLod(tMirror, uv + vec2(-d.x, -d.y * 0.4), lod) * 0.16;
    c += textureLod(tMirror, uv + vec2(-d.x * 0.4, d.y), lod) * 0.16;
    c += textureLod(tMirror, uv + vec2(d.x * 0.4, -d.y), lod) * 0.16;
    return c;
}
vec4 readMirror(vec2 uv) {
    vec4 soft = readMirrorLod(uv, uMirrorLod.y);
    vec4 sharp = readMirrorLod(uv, uMirrorLod.x);
    float near = smoothstep(0.25, 0.85, sharp.a);
    vec2 edge = smoothstep(vec2(0.0), vec2(0.03), uv) * smoothstep(vec2(0.0), vec2(0.03), 1.0 - uv);
    vec4 c = mix(soft, sharp, near) * edge.x * edge.y;
    // 검은 유리처럼 반사의 색을 빼고 밝기만 남긴다(아이콘 색이 바닥 · 수면을 누렇거나 푸르게 물들이지 않게).
    c.rgb = vec3(dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)));
    return c;
}
`;

// ---------- 스튜디오 환경광 ----------

function buildEnvironment(renderer, panels, size) {
    // 어두운 방에 흰 빛 판 몇 장. 색은 흰색만 쓰고 세기로만 조절해 푸른 기운이 끼지 않게 한다.
    const env = new Scene();
    const room = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: BLACK, side: BackSide }));
    room.scale.set(110, 70, 110);
    room.position.y = 24;
    env.add(room);
    for (const p of panels) {
        const material = new MeshBasicMaterial({ color: 0xffffff });
        material.color.multiplyScalar(p.intensity);
        const mesh = new Mesh(new PlaneGeometry(p.w, p.h), material);
        mesh.position.set(p.pos[0], p.pos[1], p.pos[2]);
        mesh.lookAt(p.look[0], p.look[1], p.look[2]);
        env.add(mesh);
    }
    const pmrem = new PMREMGenerator(renderer);
    const texture = pmrem.fromScene(env, 0, 0.1, 200, { size }).texture;
    pmrem.dispose();
    env.traverse((object) => {
        if (object.isMesh) {
            object.geometry.dispose();
            object.material.dispose();
        }
    });
    return texture;
}

// ---------- 평면 반사 ----------

class PlanarMirror {
    // 바닥(y = planeY) 아래에서 본 장면을 텍스처에 그린다(Reflector와 같은 수학). 밉맵으로 흐린 반사를 읽는다.
    // margin > 1이면 시야를 넓혀 그린다(물결로 오르내린 수면이 반사 화면 밖으로 나가지 않게).
    constructor(scale, margin = 1) {
        this.scale = scale;
        this.margin = margin;
        this.camera = new PerspectiveCamera();
        this.target = new WebGLRenderTarget(4, 4, {
            type: HalfFloatType,
            generateMipmaps: true,
            minFilter: LinearMipmapLinearFilter,
            magFilter: LinearFilter,
        });
        this.matrix = new Matrix4();
        this.texel = new Vector2(1, 1);
        this._rot = new Matrix4();
        this._pos = new Vector3();
        this._look = new Vector3();
        this._up = new Vector3();
        this._clear = new Color();
    }

    setSize(width, height) {
        const w = Math.max(16, Math.round(width * this.scale * this.margin));
        const h = Math.max(16, Math.round(height * this.scale * this.margin));
        this.target.setSize(w, h);
        this.texel.set(1 / w, 1 / h);
    }

    render(renderer, scene, camera, planeY, hidden) {
        const cam = this.camera;
        this._pos.setFromMatrixPosition(camera.matrixWorld);
        this._rot.extractRotation(camera.matrixWorld);
        this._look.set(0, 0, -1).applyMatrix4(this._rot).add(this._pos);
        this._up.set(0, 1, 0).applyMatrix4(this._rot);
        this._pos.y = 2 * planeY - this._pos.y;
        this._look.y = 2 * planeY - this._look.y;
        this._up.y = -this._up.y;
        cam.position.copy(this._pos);
        cam.up.copy(this._up);
        cam.lookAt(this._look);
        cam.updateMatrixWorld();
        if (this.margin === 1) {
            cam.projectionMatrix.copy(camera.projectionMatrix);
            cam.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
        } else {
            cam.fov = (2 * Math.atan(Math.tan((camera.fov * Math.PI) / 360) * this.margin) * 180) / Math.PI;
            cam.aspect = camera.aspect;
            cam.near = camera.near;
            cam.far = camera.far;
            cam.updateProjectionMatrix();
        }
        this.matrix.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1);
        this.matrix.multiply(cam.projectionMatrix).multiply(cam.matrixWorldInverse);

        const background = scene.background;
        const previous = renderer.getRenderTarget();
        renderer.getClearColor(this._clear);
        const alpha = renderer.getClearAlpha();
        const shown = hidden.map((object) => object.visible);
        hidden.forEach((object) => { object.visible = false; });
        scene.background = null;
        renderer.setClearColor(0x000000, 0);
        renderer.setRenderTarget(this.target);
        renderer.clear();
        renderer.render(scene, cam);
        renderer.setRenderTarget(previous);
        renderer.setClearColor(this._clear, alpha);
        scene.background = background;
        hidden.forEach((object, i) => { object.visible = shown[i]; });
    }
}

// ---------- 접지 그림자 ----------

class ContactShadow {
    // 바닥 바로 아래에서 위를 보는 정사영 카메라로 타일의 「바닥에서의 높이」를 그리고 여러 번 흐린다.
    // 바닥에 닿은 곳은 진하고, 떠오를수록 옅고 넓어진다.
    constructor(count, resolution, height) {
        this.height = height;
        this.target = new WebGLRenderTarget(resolution, resolution);
        this.blurTarget = new WebGLRenderTarget(resolution, resolution);
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, height);
        this.camera.rotation.x = Math.PI / 2;
        this.box = new Vector4(-1, -1, 2, 2);
        this.scene = new Scene();
        const material = new ShaderMaterial({
            uniforms: { uHeight: { value: height } },
            vertexShader: /* glsl */ `
                uniform float uHeight;
                varying float vHeight;
                void main() {
                    vec4 world = modelMatrix * instanceMatrix * vec4(position, 1.0);
                    vHeight = world.y;
                    // 위쪽일수록 바닥 그림자가 넓게 번지도록 옆으로 조금 부풀린다.
                    vec3 center = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
                    world.xz += (world.xz - center.xz) * clamp(world.y / (uHeight * 0.5), 0.0, 1.0) * 0.6;
                    gl_Position = projectionMatrix * viewMatrix * world;
                }`,
            fragmentShader: /* glsl */ `
                uniform float uHeight;
                varying float vHeight;
                void main() {
                    float k = 1.0 - clamp(vHeight / uHeight, 0.0, 1.0);
                    gl_FragColor = vec4(0.0, 0.0, 0.0, k * k);
                }`,
        });
        this.proxy = new InstancedMesh(new BoxGeometry(0.94, 0.94, 0.3), material, count);
        this.proxy.frustumCulled = false;
        this.scene.add(this.proxy);
        this.blurMaterial = new ShaderMaterial({
            uniforms: { tMap: { value: null }, uDir: { value: new Vector2() } },
            vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
            fragmentShader: /* glsl */ `
                uniform sampler2D tMap;
                uniform vec2 uDir;
                varying vec2 vUv;
                void main() {
                    vec4 s = texture2D(tMap, vUv) * 0.2270270270;
                    s += texture2D(tMap, vUv + uDir * 1.3846153846) * 0.3162162162;
                    s += texture2D(tMap, vUv - uDir * 1.3846153846) * 0.3162162162;
                    s += texture2D(tMap, vUv + uDir * 3.2307692308) * 0.0702702703;
                    s += texture2D(tMap, vUv - uDir * 3.2307692308) * 0.0702702703;
                    gl_FragColor = s;
                }`,
            depthTest: false,
            depthWrite: false,
            blending: NoBlending,
        });
        this.quad = new FullScreenQuad(this.blurMaterial);
        this.resolution = resolution;
        this._clear = new Color();
    }

    setBox(minX, minZ, maxX, maxZ) {
        const cx = (minX + maxX) / 2;
        const cz = (minZ + maxZ) / 2;
        const hw = (maxX - minX) / 2;
        const hd = (maxZ - minZ) / 2;
        this.camera.left = -hw;
        this.camera.right = hw;
        this.camera.top = hd;
        this.camera.bottom = -hd;
        this.camera.position.set(cx, -0.001, cz);
        this.camera.updateProjectionMatrix();
        this.camera.updateMatrixWorld();
        this.box.set(minX, minZ, maxX - minX, maxZ - minZ);
    }

    render(renderer, meshes) {
        meshes.forEach((mesh, i) => this.proxy.setMatrixAt(i, mesh.matrix));
        this.proxy.instanceMatrix.needsUpdate = true;
        const previous = renderer.getRenderTarget();
        renderer.getClearColor(this._clear);
        const alpha = renderer.getClearAlpha();
        renderer.setClearColor(0x000000, 0);
        renderer.setRenderTarget(this.target);
        renderer.clear();
        renderer.render(this.scene, this.camera);
        const texel = 1 / this.resolution;
        for (const radius of [3.2, 1.8, 0.9]) {
            this.blurMaterial.uniforms.tMap.value = this.target.texture;
            this.blurMaterial.uniforms.uDir.value.set(texel * radius, 0);
            renderer.setRenderTarget(this.blurTarget);
            this.quad.render(renderer);
            this.blurMaterial.uniforms.tMap.value = this.blurTarget.texture;
            this.blurMaterial.uniforms.uDir.value.set(0, texel * radius);
            renderer.setRenderTarget(this.target);
            this.quad.render(renderer);
        }
        renderer.setRenderTarget(previous);
        renderer.setClearColor(this._clear, alpha);
    }
}

// ---------- 후처리: 초점 거리(DOF) · 필름 그레인 ----------

export class DepthOfFieldPass extends Pass {
    // 깊이를 따로 그린 뒤, 표본마다 그 표본의 흐림 크기로 섞는다(앞의 또렷한 물체가 뒤로 번지지 않게).
    constructor(scene, camera) {
        super();
        this.scene = scene;
        this.camera = camera;
        this.depthTarget = new WebGLRenderTarget(4, 4, { minFilter: NearestFilter, magFilter: NearestFilter });
        this.depthMaterial = new MeshDepthMaterial({ depthPacking: RGBADepthPacking, blending: NoBlending });
        this.material = new ShaderMaterial({
            uniforms: {
                tColor: { value: null },
                tDepth: { value: null },
                uTexel: { value: new Vector2() },
                uFocus: { value: 10 },
                uAperture: { value: 0 },
                uMaxPx: { value: 12 },
                uScale: { value: 1 },
                uNear: { value: 0.5 },
                uFar: { value: 700 },
            },
            vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
            fragmentShader: /* glsl */ `
                #include <packing>
                uniform sampler2D tColor;
                uniform sampler2D tDepth;
                uniform vec2 uTexel;
                uniform float uFocus;
                uniform float uAperture;
                uniform float uMaxPx;
                uniform float uScale;
                uniform float uNear;
                uniform float uFar;
                varying vec2 vUv;
                float viewDist(vec2 uv) {
                    float d = unpackRGBAToDepth(texture2D(tDepth, uv));
                    return -perspectiveDepthToViewZ(d, uNear, uFar);
                }
                float blurSize(float dist) {
                    return clamp(uAperture * abs(1.0 - uFocus / max(dist, 0.001)), 0.0, uMaxPx);
                }
                void main() {
                    vec3 color = texture2D(tColor, vUv).rgb;
                    float cd = viewDist(vUv);
                    float cs = blurSize(cd);
                    float tot = 1.0;
                    float radius = 0.75;
                    float ang = 0.0;
                    for (int i = 0; i < 80; i++) {
                        if (radius >= uMaxPx) break;
                        vec2 tc = vUv + vec2(cos(ang), sin(ang)) * uTexel * radius * uScale;
                        vec3 sc = texture2D(tColor, tc).rgb;
                        float sd = viewDist(tc);
                        float ss = blurSize(sd);
                        if (sd > cd) ss = clamp(ss, 0.0, cs * 2.0);
                        float m = smoothstep(radius - 0.5, radius + 0.5, ss);
                        color += mix(color / tot, sc, m);
                        tot += 1.0;
                        radius += 1.6 / radius;
                        ang += 2.39996323;
                    }
                    gl_FragColor = vec4(color / tot, 1.0);
                }`,
            depthTest: false,
            depthWrite: false,
        });
        this.quad = new FullScreenQuad(this.material);
        this._clear = new Color();
    }

    setSize(width, height) {
        this.depthTarget.setSize(width, height);
        this.material.uniforms.uTexel.value.set(1 / width, 1 / height);
    }

    render(renderer, writeBuffer, readBuffer) {
        const u = this.material.uniforms;
        renderer.getClearColor(this._clear);
        const alpha = renderer.getClearAlpha();
        const background = this.scene.background;
        this.scene.overrideMaterial = this.depthMaterial;
        this.scene.background = null;
        renderer.setClearColor(0xffffff, 1);
        renderer.setRenderTarget(this.depthTarget);
        renderer.clear();
        renderer.render(this.scene, this.camera);
        this.scene.overrideMaterial = null;
        this.scene.background = background;
        renderer.setClearColor(this._clear, alpha);
        u.tColor.value = readBuffer.texture;
        u.tDepth.value = this.depthTarget.texture;
        u.uNear.value = this.camera.near;
        u.uFar.value = this.camera.far;
        renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
        this.quad.render(renderer);
    }
}

export class GrainPass extends Pass {
    // 아주 옅은 흑백 필름 그레인(초당 24번 바뀜). 밝은 곳보다 어두운 곳에 조금 더.
    constructor(amount) {
        super();
        this.material = new ShaderMaterial({
            uniforms: { tDiffuse: { value: null }, uTime: { value: 0 }, uAmount: { value: amount } },
            vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
            fragmentShader: /* glsl */ `
                uniform sampler2D tDiffuse;
                uniform float uTime;
                uniform float uAmount;
                varying vec2 vUv;
                float hash(vec2 p) {
                    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
                    p3 += dot(p3, p3.yzx + 33.33);
                    return fract((p3.x + p3.y) * p3.z);
                }
                void main() {
                    vec4 c = texture2D(tDiffuse, vUv);
                    float n = hash(gl_FragCoord.xy + floor(uTime * 24.0) * vec2(37.0, 17.0)) - 0.5;
                    float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722));
                    c.rgb += n * uAmount * (0.45 + 0.55 * (1.0 - l));
                    gl_FragColor = c;
                }`,
            depthTest: false,
            depthWrite: false,
        });
        this.quad = new FullScreenQuad(this.material);
    }

    render(renderer, writeBuffer, readBuffer) {
        this.material.uniforms.tDiffuse.value = readBuffer.texture;
        renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer);
        this.quad.render(renderer);
    }
}

// ---------- 무대 공통 ----------

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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

function faceYaw(from, to) {
    return Math.atan2(to.x - from.x, to.z - from.z);
}

function mirrorFade(fadeK) {
    // 타일 재질에 붙인다. 반사를 그릴 때만 바닥에서 멀어질수록 어둡고 옅게(알파 = 바닥과 가까운 정도).
    const pass = { value: 0 };
    const k = { value: fadeK };
    function decorate(material) {
        material.onBeforeCompile = (shader) => {
            shader.uniforms.uMirrorPass = pass;
            shader.uniforms.uMirrorFadeK = k;
            shader.vertexShader = shader.vertexShader
                .replace("#include <common>", "#include <common>\nvarying float vStageY;")
                .replace("#include <project_vertex>", "#include <project_vertex>\nvStageY = (modelMatrix * vec4(transformed, 1.0)).y;");
            shader.fragmentShader = shader.fragmentShader
                .replace("#include <common>", "#include <common>\nuniform float uMirrorPass;\nuniform float uMirrorFadeK;\nvarying float vStageY;")
                .replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragColor *= mix(1.0, exp(-max(vStageY, 0.0) * uMirrorFadeK), uMirrorPass);");
        };
        material.customProgramCacheKey = () => "stage-mirror-fade";
    }
    return { pass, k, decorate };
}

export function createStage(kind, ctx) {
    return kind === "2" ? liquidStage(ctx) : studioStage(ctx);
}

// ---------- 1. 제품 공개 스튜디오 ----------

function studioStage(ctx) {
    const { renderer, scene, envRotation, lowPower, count } = ctx;
    scene.fog = new Fog(BLACK, 15, 64);

    // 빛: 위 큰 소프트박스(고르게), 카메라 뒤 긴 세로 띠(앞면을 쓸고 지나가는 주 띠 조명),
    // 옆의 가는 띠(모서리 윤곽), 타일 뒤 낮고 넓은 판(바닥에 길게 비치는 광택).
    const envMap = buildEnvironment(renderer, [
        { w: 26, h: 14, intensity: 0.4, pos: [0, 34, 0], look: [0, 0, 0] },
        { w: 1.3, h: 40, intensity: 13, pos: [0, 12, 36], look: [0, 12, 0] },
        { w: 1.1, h: 40, intensity: 2.4, pos: [-34, 12, -10], look: [0, 12, -10] },
        { w: 1.8, h: 7, intensity: 3, pos: [9, 3.5, -40], look: [0, 3.5, 0] },
        { w: 0.8, h: 40, intensity: 1.1, pos: [34, 12, 6], look: [0, 12, 6] },
        { w: 64, h: 6, intensity: 0.22, pos: [0, 4, -48], look: [0, 4, 0] },
    ], lowPower ? 256 : 512);

    const mirror = new PlanarMirror(lowPower ? 0.34 : 0.5);
    const shadow = new ContactShadow(count, lowPower ? 256 : 512, 2.6);
    const fade = mirrorFade(1.25);

    const uniforms = {
        tMirror: { value: mirror.target.texture },
        uMirrorMatrix: { value: mirror.matrix },
        uMirrorTexel: { value: mirror.texel },
        uMirrorLod: { value: lowPower ? new Vector2(0.4, 1.8) : new Vector2(0.6, 2.6) },
        uReflect: { value: 0.62 },
        tShadow: { value: shadow.target.texture },
        uShadowBox: { value: shadow.box },
        uShadow: { value: 0.9 },
    };
    // 광택 현무암: 아주 어두운 바탕 + 맑은 코팅(띠 조명이 길게 비침). 넓은 결로 거칠기가 조금씩 다르고, 판이 아주 완만하게 굽어 반사가 살짝 흔들린다.
    const floorMaterial = new MeshPhysicalMaterial({
        color: 0x121212,
        roughness: 0.42,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMap,
        envMapIntensity: 1,
    });
    floorMaterial.envMapRotation = envRotation;
    floorMaterial.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", "#include <common>\nuniform mat4 uMirrorMatrix;\nvarying vec4 vMirrorCoord;\nvarying vec3 vStone;")
            .replace("#include <project_vertex>", "#include <project_vertex>\nvec4 stoneWorld = modelMatrix * vec4(transformed, 1.0);\nvStone = stoneWorld.xyz;\nvMirrorCoord = uMirrorMatrix * stoneWorld;");
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>
${NOISE_GLSL}
${MIRROR_GLSL}
uniform sampler2D tShadow;
uniform vec4 uShadowBox;
uniform float uShadow;
uniform float uReflect;
varying vec4 vMirrorCoord;
varying vec3 vStone;
float slabHeight(vec2 p) {
    return stNoise(p * 0.21) * 0.7 + stNoise(p * 0.53 + 4.1) * 0.3;
}`)
            .replace("#include <roughnessmap_fragment>", `#include <roughnessmap_fragment>
float stoneWide = stNoise(vStone.xz * 0.07) * 0.6 + stNoise(vStone.xz * 0.23 + 11.0) * 0.4;
roughnessFactor = clamp(roughnessFactor * (0.7 + 0.6 * stoneWide), 0.05, 1.0);`)
            .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
float slabFade = 1.0 - smoothstep(14.0, 60.0, length(vViewPosition));
float sh0 = slabHeight(vStone.xz);
vec2 slabGrad = vec2(slabHeight(vStone.xz + vec2(0.05, 0.0)) - sh0, slabHeight(vStone.xz + vec2(0.0, 0.05)) - sh0) / 0.05;
slabGrad *= slabFade * 0.018;
normal = normalize(normal - (viewMatrix * vec4(slabGrad.x, 0.0, slabGrad.y, 0.0)).xyz);`)
            .replace("#include <clearcoat_normal_fragment_maps>", `#include <clearcoat_normal_fragment_maps>
#ifdef USE_CLEARCOAT
clearcoatNormal = normalize(clearcoatNormal - (viewMatrix * vec4(slabGrad.x, 0.0, slabGrad.y, 0.0)).xyz);
#endif`)
            .replace("#include <opaque_fragment>", `{
    vec2 shadowUv = (vStone.xz - uShadowBox.xy) / uShadowBox.zw;
    float inBox = step(0.0, shadowUv.x) * step(shadowUv.x, 1.0) * step(0.0, shadowUv.y) * step(shadowUv.y, 1.0);
    float contact = texture2D(tShadow, shadowUv).a * inBox * uShadow;
    vec4 refl = readMirror(vMirrorCoord.xy / vMirrorCoord.w + slabGrad * 0.4);
    float NoV = saturate(dot(geometryNormal, geometryViewDir));
    float fres = 0.045 + 0.955 * pow(1.0 - NoV, 5.0);
    outgoingLight *= 1.0 - contact;
    outgoingLight = outgoingLight * (1.0 - refl.a * fres) + refl.rgb * fres * uReflect;
}
#include <opaque_fragment>`);
    };
    const floor = new Mesh(new PlaneGeometry(600, 600), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.z = -200;
    scene.add(floor);

    // 붉은 점 하나의 자리: 맨 앞 타일 오른쪽 앞 바닥(촬영장 자리 표시). 점은 home.js가 화면 위에 정확한 색 원으로 찍는다.
    const markPos = new Vector3();

    const hidden = [floor];
    const heroCam = { pos: new Vector3(), target: new Vector3() };
    const ROWS = [1, 4, 5, 8, 9, 16];
    // 세로 화면은 카메라가 높아 바닥에 비친 뒤쪽 띠 조명이 타일 사이에 크게 걸린다. 그만큼 바닥 광택을 줄인다.
    let floorGloss = 1;

    function heroLayout(tiles, view) {
        // 최신 앱이 맨 앞 가운데(초점). 뒤로 갈수록 줄이 넓어지는 엇갈린 줄로 서 있고, 오래된 앱일수록 뒤 줄에 선다.
        const n = tiles.length;
        const s = 2.2;
        const r = mulberry32(2026);
        floorGloss = view.portrait ? 0.5 : 1;
        if (view.portrait) {
            heroCam.pos.set(0.9, 3.3, 16.5);
            heroCam.target.set(-0.1, 1.05, -4);
        } else {
            heroCam.pos.set(2.0, 2.6, 10.6);
            heroCam.target.set(-0.3, 1.0, -4);
        }
        let k = 0;
        let row = 0;
        let minX = Infinity;
        let maxX = -Infinity;
        let minZ = Infinity;
        let maxZ = -Infinity;
        while (k < n) {
            const inRow = Math.min(ROWS[Math.min(row, ROWS.length - 1)], n - k);
            // 뒤 줄은 넓게 벌리고 줄마다 옆으로 엇갈려, 빗살처럼 같은 간격이 되풀이되지 않게 한다.
            const dx = s * ((view.portrait ? 2.3 : 2.05) + row * 0.06);
            const z0 = row === 0 ? 0 : -(1.6 + row * 1.3) * s;
            const shift = row === 0 ? 0 : (r() - 0.5) * dx * 0.5;
            for (let j = 0; j < inRow; j += 1) {
                const tile = tiles[n - 1 - k];
                const x = row === 0 ? 0 : (j - (inRow - 1) / 2) * dx + shift + (r() - 0.5) * 0.5;
                const z = z0 - (row === 0 ? 0 : 0.012 * x * x + (r() - 0.5) * 1.8);
                tile.S.pos.set(x, s / 2 + 0.004, z);
                tile.S.s = s;
                tile.S.rot.set(0, faceYaw(tile.S.pos, heroCam.pos) + (row === 0 ? -0.18 : (r() - 0.5) * 0.24), 0);
                tile.heroRank = k / (n - 1);
                tile.heroLight = row === 0 ? 1 : 0.15 * Math.pow(0.74, row - 1);
                if (row < 4) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minZ = Math.min(minZ, z);
                    maxZ = Math.max(maxZ, z);
                }
                k += 1;
            }
            row += 1;
        }
        const focal = tiles[n - 1];
        markPos.set(focal.S.pos.x + 1.55, 0.004, focal.S.pos.z + 1.35);
        // 접지 그림자 범위: 앞쪽 네 줄과 숫자 · 벽 아래쪽을 함께 덮는다.
        shadow.setBox(Math.min(minX, -16) - 2, Math.min(minZ, -4) - 2, Math.max(maxX, 16) + 2, Math.max(maxZ, 4) + 2);
        return { pos: heroCam.pos, target: heroCam.target, focal, bob: 0, standing: true };
    }

    function resize(width, height) {
        mirror.setSize(width, height);
    }

    function update(state) {
        // 띠 조명은 타일 앞을 아주 천천히 오간다(한 번 오가는 데 40초). 첫 등장 때는 바깥에서 들어와 앞면을 한 번 쓸고 지나간다.
        // 스크롤하면 빛이 조금 밀린다. 달력 · 숫자 · 벽에서는 바닥 광택을 거의 꺼서 타일 뒤에 빛 얼룩이 뜨지 않게 한다.
        const intro = state.reduced ? 1 : easeInOut(Math.min(1, state.time / 4.2));
        const sway = Math.sin((state.time * Math.PI * 2) / 40) * 0.42;
        envRotation.y = (1 - intro) * -1.25 + sway + state.scrollTurn * 0.5 - 0.12;
        floorMaterial.envMapIntensity = state.reveal * (1 - 0.94 * state.form) * floorGloss;
    }

    function prepare(renderer, camera, meshes) {
        shadow.render(renderer, meshes);
        fade.pass.value = 1;
        mirror.render(renderer, scene, camera, 0, hidden);
        fade.pass.value = 0;
    }

    function poke() {}

    return { kind: "1", envMap, dof: { aperture: 21, maxPx: 18 }, faceRig: 1, markPos, decorate: fade.decorate, heroLayout, resize, update, prepare, poke, mirror };
}

// ---------- 2. 검은 액체 금속 ----------

function liquidStage(ctx) {
    const { renderer, scene, envRotation, lowPower } = ctx;
    scene.fog = new Fog(BLACK, 16, 64);

    // 빛: 앞 위쪽의 넓은 소프트박스(물결 등성이에 넓고 부드러운 광택), 머리 위 가는 띠(가까운 물결에 선 하나),
    // 카메라 뒤 세로 띠(타일 앞면), 옆 가는 띠(모서리).
    const envMap = buildEnvironment(renderer, [
        { w: 120, h: 4.2, intensity: 1.2, pos: [0, 17.5, -50], look: [0, 0, 0] },
        { w: 2.6, h: 40, intensity: 8, pos: [0, 12, 36], look: [0, 12, 0] },
        { w: 1.1, h: 40, intensity: 5, pos: [-34, 12, -6], look: [0, 12, -6] },
        { w: 0.8, h: 40, intensity: 3, pos: [34, 12, 10], look: [0, 12, 10] },
    ], lowPower ? 256 : 512);
    // 액체는 앞쪽 넓은 띠 하나만 비춘다(세로 띠가 물결 위에 동심원 무늬를 만들지 않게).
    const liquidEnv = buildEnvironment(renderer, [
        { w: 120, h: 4.2, intensity: 1.2, pos: [0, 17.5, -50], look: [0, 0, 0] },
    ], lowPower ? 256 : 512);

    const mirror = new PlanarMirror(lowPower ? 0.3 : 0.45, 1.4);
    const fade = mirrorFade(0.6);
    const ripples = [new Vector4(), new Vector4(), new Vector4(), new Vector4()];
    let rippleIndex = 0;
    const uniforms = {
        tMirror: { value: mirror.target.texture },
        uMirrorMatrix: { value: mirror.matrix },
        uMirrorTexel: { value: mirror.texel },
        uMirrorLod: { value: lowPower ? new Vector2(0.6, 1.6) : new Vector2(0.8, 2.2) },
        uReflect: { value: 0.9 },
        uTime: { value: 0 },
        uRipples: { value: ripples },
        uCenter: { value: new Vector2(0, -10) },
    };
    // 물결 네 겹: [방향 x, 방향 z, 파수, 높이, 속도]. 셰이더와 타일 띄우기(surface)가 같은 값을 쓴다.
    const WAVE_SET = [
        [0.8, 0.6, 0.24, 0.32, 0.17],
        [-0.55, 0.835, 0.38, 0.1, 0.22],
        [0.2, -0.98, 0.52, 0.06, 0.27],
        [-0.93, -0.37, 0.8, 0.025, 0.34],
    ];
    const f = (v) => v.toFixed(4);
    const WAVES = /* glsl */ `
uniform float uTime;
uniform vec4 uRipples[4];
uniform vec2 uCenter;
void addWave(inout vec3 r, vec2 p, vec2 d, float k, float a, float w) {
    float ph = dot(d, p) * k + uTime * w;
    r.x += a * sin(ph);
    r.yz += a * k * cos(ph) * d;
}
vec3 liquid(vec2 p) {
    vec3 r = vec3(0.0);
${WAVE_SET.map(([dx, dz, k, a, w]) => `    addWave(r, p, vec2(${f(dx)}, ${f(dz)}), ${f(k)}, ${f(a)}, ${f(w)});`).join("\n")}
    for (int i = 0; i < 4; i++) {
        vec4 rp = uRipples[i];
        float age = uTime - rp.z;
        if (rp.w > 0.0 && age > 0.0 && age < 14.0) {
            vec2 dv = p - rp.xy;
            float dist = length(dv) + 0.0001;
            float x = dist - age * 2.4;
            float env = exp(-x * x / 6.0) * exp(-age * 0.3) * rp.w;
            float ph = x * 1.1;
            r.x += 0.18 * env * cos(ph);
            float dh = -0.18 * env * (1.1 * sin(ph) + (2.0 * x / 6.0) * cos(ph));
            r.yz += dh * dv / dist;
        }
    }
    float fade = 1.0 - smoothstep(70.0, 240.0, length(p - uCenter));
    return r * fade;
}`;
    // 검은 크롬 같은 액체: 거울처럼 반사하지만 방이 검어서 거의 검고, 넓은 빛 판이 물결 등성이를 따라 부드럽게 흐른다.
    const liquidMaterial = new MeshPhysicalMaterial({
        color: 0xffffff,
        metalness: 1,
        roughness: 0.2,
        envMap: liquidEnv,
        envMapIntensity: 0.05,
    });
    liquidMaterial.envMapRotation = envRotation;
    liquidMaterial.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
            .replace("#include <common>", `#include <common>
${WAVES}
uniform mat4 uMirrorMatrix;
varying vec4 vMirrorCoord;
varying vec3 vLiquid;`)
            .replace("#include <beginnormal_vertex>", `vec3 liq = liquid(position.xz);
vec3 objectNormal = normalize(vec3(-liq.y, 1.0, -liq.z));`)
            .replace("#include <begin_vertex>", "vec3 transformed = vec3(position.x, position.y + liq.x, position.z);")
            .replace("#include <project_vertex>", "#include <project_vertex>\nvec4 liquidWorld = modelMatrix * vec4(transformed, 1.0);\nvLiquid = liquidWorld.xyz;\nvMirrorCoord = uMirrorMatrix * liquidWorld;");
        shader.fragmentShader = shader.fragmentShader
            .replace("#include <common>", `#include <common>
${WAVES}
${MIRROR_GLSL}
uniform float uReflect;
varying vec4 vMirrorCoord;
varying vec3 vLiquid;`)
            .replace("#include <normal_fragment_maps>", `#include <normal_fragment_maps>
// 물결 기울기를 픽셀마다 다시 계산한다(격자가 성긴 먼 곳에서도 반사 윤곽이 각지지 않게).
vec2 lp = vLiquid.xz;
vec3 liqPx = liquid(lp);
float liqFade = 1.0 - smoothstep(14.0, 46.0, length(vViewPosition));
vec2 fine = vec2(cos(dot(lp, vec2(1.3, 0.7)) + uTime * 0.5), cos(dot(lp, vec2(-0.6, 1.6)) + uTime * 0.43)) * 0.01 * liqFade;
vec3 liqN = normalize(vec3(-liqPx.y - fine.x, 1.0, -liqPx.z - fine.y));
normal = normalize((viewMatrix * vec4(liqN, 0.0)).xyz);`)
            .replace("#include <opaque_fragment>", `{
    // 가까운 타일만 수면에 또렷이 비치고, 먼 반사는 물결에 늘어나 어지러워지기 전에 사라진다.
    vec2 bend = liqN.xz * 0.03 / (1.0 + length(vViewPosition) * 0.04);
    vec4 refl = readMirror(vMirrorCoord.xy / vMirrorCoord.w + bend) * (1.0 - smoothstep(12.5, 22.0, length(vViewPosition)));
    float NoV = saturate(dot(normal, geometryViewDir));
    float fres = 0.42 + 0.58 * pow(1.0 - NoV, 3.0);
    outgoingLight = outgoingLight * (1.0 - refl.a * fres * 0.9) + refl.rgb * fres * uReflect;
}
#include <opaque_fragment>`);
    };

    // 앞쪽은 촘촘하고 멀수록 성긴 사다리꼴 격자(정점 높이는 셰이더에서 계산).
    const rows = lowPower ? 150 : 240;
    const cols = lowPower ? 100 : 160;
    const zNear = 26;
    const zFar = -360;
    const positions = new Float32Array(rows * cols * 3);
    for (let r = 0; r < rows; r += 1) {
        const t = Math.pow(r / (rows - 1), 2.1);
        const z = zNear + (zFar - zNear) * t;
        const half = 22 + (zNear - z) * 0.72;
        for (let c = 0; c < cols; c += 1) {
            const i = (r * cols + c) * 3;
            positions[i] = -half + (2 * half * c) / (cols - 1);
            positions[i + 1] = 0;
            positions[i + 2] = z;
        }
    }
    const index = [];
    for (let r = 0; r < rows - 1; r += 1) {
        for (let c = 0; c < cols - 1; c += 1) {
            const a = r * cols + c;
            const b = (r + 1) * cols + c;
            index.push(a, a + 1, b, a + 1, b + 1, b);
        }
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geometry.setAttribute("normal", new Float32BufferAttribute(new Float32Array(rows * cols * 3).fill(0), 3));
    geometry.setIndex(index);
    geometry.computeBoundingSphere();
    const liquidMesh = new Mesh(geometry, liquidMaterial);
    liquidMesh.frustumCulled = false;
    scene.add(liquidMesh);

    // 붉은 점 하나의 자리: 맨 앞 타일 오른쪽 앞, 수면 바로 위(물결을 따라 오르내린다). 점은 home.js가 찍는다.
    const markPos = new Vector3();

    const hidden = [liquidMesh];
    const heroCam = { pos: new Vector3(), target: new Vector3() };
    const dropBase = new Vector3();

    function heroLayout(tiles, view) {
        // 최신 앱이 앞에 크게 떠 있고, 나머지는 수면 위로 흩어져 뒤로 물러난다(겹치지 않게 자리를 고른다).
        const n = tiles.length;
        const s = 2.1;
        const r = mulberry32(4343);
        if (view.portrait) {
            heroCam.pos.set(-0.8, 6.4, 19);
            heroCam.target.set(0.3, 0.35, -5.5);
        } else {
            heroCam.pos.set(-1.1, 3.7, 9.9);
            heroCam.target.set(0.5, 0.95, -6.2);
        }
        const placed = [];
        // 카메라에서 본 초점 타일 방향. 가까운 타일이 그 바로 뒤에 겹쳐 서지 않게 한다.
        const focalYaw = Math.atan2(-heroCam.pos.x, heroCam.pos.z);
        for (let k = 0; k < n; k += 1) {
            const tile = tiles[n - 1 - k];
            let x = 0;
            let y = 0.08 + s / 2;
            let z = 0;
            if (k > 0) {
                for (let attempt = 0; attempt < 60; attempt += 1) {
                    const depth = 5 + Math.pow(k / (n - 1), 0.62) * 58 + (r() - 0.5) * 3;
                    const spread = 4.0 + depth * 0.62;
                    x = (r() * 2 - 1) * spread;
                    z = -depth;
                    const yaw = Math.atan2(x - heroCam.pos.x, heroCam.pos.z - z);
                    const clear = Math.abs(yaw - focalYaw) > (view.portrait ? 0.2 : 0.14) || depth > 34;
                    const ok = clear && placed.every((p) => Math.hypot(p.x - x, p.z - z) > s * 1.55);
                    if (ok) break;
                }
                y = 0.16 + r() * 0.3 + s / 2;
            }
            placed.push({ x, z });
            tile.S.pos.set(x, y, z);
            tile.S.s = s;
            tile.S.rot.set(-0.08 + (r() - 0.5) * 0.1, faceYaw(tile.S.pos, heroCam.pos) + (k === 0 ? 0.26 : (r() - 0.5) * 0.5), (r() - 0.5) * 0.08);
            tile.heroRank = k / (n - 1);
            tile.heroLight = k === 0 ? 1 : Math.max(0.14, 0.42 - Math.hypot(x, z) * 0.012);
        }
        const focal = tiles[n - 1];
        dropBase.set(focal.S.pos.x + 1.7, 0.1, focal.S.pos.z + 0.6);
        return { pos: heroCam.pos, target: heroCam.target, focal, bob: 0.35, standing: false };
    }

    function resize(width, height) {
        mirror.setSize(width, height);
    }

    function update(state) {
        liquidMaterial.envMapIntensity = 0.05 * state.reveal * (1 - 0.75 * state.form) * (1 - state.wall);
        uniforms.uTime.value = state.reduced ? 0 : state.time;
        const intro = state.reduced ? 1 : easeInOut(Math.min(1, state.time / 4.2));
        const sway = Math.sin((state.time * Math.PI * 2) / 48) * 0.36;
        envRotation.y = (1 - intro) * 0.35 + sway + state.scrollTurn * 0.4;
        const t = state.reduced ? 0 : state.time;
        markPos.set(dropBase.x, surface(dropBase.x, dropBase.z, t) + dropBase.y, dropBase.z);
    }

    function prepare(renderer, camera) {
        fade.pass.value = 1;
        mirror.render(renderer, scene, camera, 0, hidden);
        fade.pass.value = 0;
    }

    function surface(x, z, time, slope) {
        // 셰이더의 물결과 같은 식(누른 자리 물결은 빼고). 높이를 돌려주고 기울기는 slope에 담는다.
        let h = 0;
        let gx = 0;
        let gz = 0;
        const t = uniforms.uTime.value;
        for (const [dx, dz, k, a, w] of WAVE_SET) {
            const ph = (dx * x + dz * z) * k + t * w;
            h += a * Math.sin(ph);
            gx += a * k * Math.cos(ph) * dx;
            gz += a * k * Math.cos(ph) * dz;
        }
        if (slope) slope.set(gx, gz);
        return h;
    }

    const plane = new Vector3();
    function poke(ray, time) {
        // 수면을 누르면 그 자리에서 느린 물결이 번진다.
        if (Math.abs(ray.direction.y) < 0.0001) return;
        const t = -ray.origin.y / ray.direction.y;
        if (t <= 0) return;
        plane.copy(ray.origin).addScaledVector(ray.direction, t);
        ripples[rippleIndex].set(plane.x, plane.z, time, 1);
        rippleIndex = (rippleIndex + 1) % ripples.length;
    }

    // 앞면 코팅의 넓은 띠 반사가 어두운 아이콘을 뿌옇게 덮지 않게, 달력 · 숫자 · 벽에서는 앞면 반사를 1/3로.
    return { kind: "2", envMap, dof: { aperture: 9, maxPx: 12 }, faceRig: 0.33, markPos, decorate: fade.decorate, heroLayout, resize, update, prepare, poke, surface, mirror };
}
