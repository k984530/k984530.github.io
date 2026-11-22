// Entry used to build portfolio/lib/three-0.186.1.min.js (not loaded by the page).
// three@0.186.1 from npm (sha1 6d50f70c2c437f844179bbb56d6f5b774e1ca38a), then:
//   npx esbuild@0.28.2 three-entry.js --bundle --format=esm --minify --target=es2020 --legal-comments=none --outfile=three-0.186.1.min.js
// Add an export here when portfolio/home.js imports a new three.js class, and rebuild.
export {
    Color,
    DirectionalLight,
    ExtrudeGeometry,
    Mesh,
    MeshStandardMaterial,
    NoToneMapping,
    PerspectiveCamera,
    PMREMGenerator,
    Raycaster,
    Scene,
    Shape,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    Vector3,
    WebGLRenderer,
} from "three";
export { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
