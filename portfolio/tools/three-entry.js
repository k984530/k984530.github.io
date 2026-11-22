// Entry used to build portfolio/lib/three-0.186.1.min.js (not loaded by the page).
// three@0.186.1 from npm (sha1 6d50f70c2c437f844179bbb56d6f5b774e1ca38a), then:
//   npx esbuild@0.28.2 three-entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=none --outfile=three-0.186.1.min.js
// Add an export here when portfolio/home.js or portfolio/backgrounds.js imports a new three.js class, and rebuild.
export {
    BackSide,
    BoxGeometry,
    BufferGeometry,
    Color,
    DirectionalLight,
    DoubleSide,
    ExtrudeGeometry,
    Float32BufferAttribute,
    Fog,
    Group,
    InstancedMesh,
    Matrix4,
    Mesh,
    MeshBasicMaterial,
    MeshStandardMaterial,
    NoToneMapping,
    PerspectiveCamera,
    Plane,
    PlaneGeometry,
    PMREMGenerator,
    Raycaster,
    Scene,
    Shape,
    SphereGeometry,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4,
    WebGLRenderer,
} from "three";
export { Reflector } from "three/addons/objects/Reflector.js";
