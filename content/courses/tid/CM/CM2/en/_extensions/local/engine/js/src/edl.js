import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";


// Main
export function create_composer_with_edl(renderer, scene, camera) {
    //---------------
    
    const params = new URLSearchParams(window.location.search);
    const edlParam = params.get("edl");
    const enableEDL = (edlParam === "1" || edlParam === "true");


    // Supersampling léger (augmente si ta machine suit)
    const SCALE = 1.5;

    function makeSize() {
        const w = Math.max(1, Math.floor(window.innerWidth * SCALE));
        const h = Math.max(1, Math.floor(window.innerHeight * SCALE));
        return { w, h };
    }

    const { w, h } = makeSize();

    // RenderTarget avec depth texture (important pour EDL)
    const rt = new THREE.WebGLRenderTarget(w, h, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        // pas besoin de stencil pour EDL
        stencilBuffer: false,
    });

    rt.depthTexture = new THREE.DepthTexture(w, h);
    rt.depthTexture.type = THREE.UnsignedShortType;

    const composer = new EffectComposer(renderer, rt);
    composer.addPass(new RenderPass(scene, camera));

    const edlPass = new ShaderPass(EDLShader);
    edlPass.enabled = enableEDL;

    // Brancher la depth texture du RT
    edlPass.uniforms.tDepth.value = rt.depthTexture;

    // Paramètres fixes (pas besoin de toucher runtime)
    edlPass.uniforms.resolution.value.set(w, h);
    edlPass.uniforms.cameraNear.value = camera.near;
    edlPass.uniforms.cameraFar.value = camera.far;

    composer.addPass(edlPass);

    function onResize() {
        const { w: nw, h: nh } = makeSize();

        rt.setSize(nw, nh);
        rt.depthTexture.image.width = nw;
        rt.depthTexture.image.height = nh;

        composer.setSize(nw, nh);

        edlPass.uniforms.resolution.value.set(nw, nh);
        edlPass.uniforms.cameraNear.value = camera.near;
        edlPass.uniforms.cameraFar.value = camera.far;
    }

    //---------------
    return composer;
}

// Shader
const EDLShader = {
    uniforms: {
        tDiffuse: { value: null },
        tDepth: { value: null },
        resolution: { value: new THREE.Vector2(1, 1) },

        // Réglés pour cloud (tu peux les laisser comme ça)
        strength: { value: 0.85 },   // baisse si trop “sale”
        radius: { value: 3.0 },      // 2..4 px (plus grand = moins moiré)
        epsilon: { value: 0.006 },   // seuil anti-bruit (augmente si ça grésille)

        cameraNear: { value: 0.1 },
        cameraFar: { value: 200.0 },
    },

  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: /* glsl */ `
    varying vec2 vUv;

    uniform sampler2D tDiffuse;
    uniform sampler2D tDepth;
    uniform vec2 resolution;

    uniform float strength;
    uniform float radius;
    uniform float epsilon;
    uniform float cameraNear;
    uniform float cameraFar;

    float linearizeDepth(float d){
      float z = d * 2.0 - 1.0;
      return (2.0 * cameraNear * cameraFar) /
             (cameraFar + cameraNear - z * (cameraFar - cameraNear));
    }

    // hash stable par pixel
    float hash(vec2 p){
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;

      float d0 = linearizeDepth(texture2D(tDepth, vUv).r);

      vec2 px = 1.0 / resolution;

      // jitter par pixel pour casser les motifs réguliers (réduit le moiré)
      float h = hash(gl_FragCoord.xy);
      float a = 6.2831853 * h;
      vec2 jitter = (vec2(cos(a), sin(a)) * 0.5) * px; // +/- 0.5 px

      // 12 taps (plus lisse que 8)
      vec2 dirs[12];
      dirs[0]=vec2( 1.0, 0.0);  dirs[1]=vec2(-1.0, 0.0);
      dirs[2]=vec2( 0.0, 1.0);  dirs[3]=vec2( 0.0,-1.0);
      dirs[4]=vec2( 1.0, 1.0);  dirs[5]=vec2(-1.0, 1.0);
      dirs[6]=vec2( 1.0,-1.0);  dirs[7]=vec2(-1.0,-1.0);
      dirs[8]=vec2( 2.0, 1.0);  dirs[9]=vec2(-2.0, 1.0);
      dirs[10]=vec2( 2.0,-1.0); dirs[11]=vec2(-2.0,-1.0);

      float occ = 0.0;
      float r = radius;

      for (int i = 0; i < 12; i++) {
        vec2 uvN = vUv + (dirs[i] * r) * px + jitter;
        // clamp uv pour éviter bords (simple)
        uvN = clamp(uvN, vec2(0.001), vec2(0.999));

        float di = linearizeDepth(texture2D(tDepth, uvN).r);
        float diff = d0 - di;

        // seuil anti micro-diff (gros contributeur au moiré)
        occ += max(0.0, diff - epsilon);
      }

      occ /= 12.0;

      // clamp doux pour éviter les “marches”
      occ = clamp(occ * strength, 0.0, 0.85);

      col *= (1.0 - occ);

      gl_FragColor = vec4(col, 1.0);
    }
  `,
};
