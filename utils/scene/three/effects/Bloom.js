import THREE from "../three";
import BloomVert from "../shaders/bloom.vert";
import BloomFrag from "../shaders/bloom.frag";
import * as dat from 'dat.gui';

export default class BloomController {

  constructor({scene, camera, renderer}) {
    this.restoreItems = [];
    this.changedMaterials = [];
    this.renderer = renderer;
    this.blackMaterial = new THREE.MeshBasicMaterial({color: "black"});
    const bloomParams = {
      exposure: 1,
      bloomStrength: .4,
      bloomThreshold: 0,
      bloomRadius: 1
    };

    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);

    bloomPass.threshold = bloomParams.bloomThreshold;
    bloomPass.strength = bloomParams.bloomStrength;
    bloomPass.radius = bloomParams.bloomRadius;

    const renderScene = new THREE.RenderPass(scene, camera);

    const bloomComposer = new THREE.EffectComposer(renderer);
    bloomComposer.renderToScreen = false;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    const finalPass = new THREE.ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: {value: null},
          bloomTexture: {value: bloomComposer.renderTarget2.texture}
        },
        vertexShader: BloomVert,
        fragmentShader: BloomFrag,
        defines: {}
      }), "baseTexture"
    );
    finalPass.needsSwap = true;

    this.scene = scene;
    this.finalPass = finalPass;
    this.bloomPass = bloomPass;
    this.bloomParams = bloomParams;
    this.bloomComposer = bloomComposer;

    if (DEBUG)
      this.initDebug();
  }

  initDebug() {
    const {bloomPass, bloomParams: params} = this;

    const gui = global.addedGUI || new dat.GUI();

    gui.add(params, 'bloomThreshold', 0.0, 1.0).onChange(function (value) {
      bloomPass.threshold = Number(value);
    });

    gui.add(params, 'bloomStrength', 0.0, 3.0).onChange(function (value) {
      bloomPass.strength = Number(value);
    });

    gui.add(params, 'bloomRadius', 0.0, 1.0).step(0.01).onChange(function (value) {
      bloomPass.radius = Number(value);
    });
  }

  resize(w, h) {
    this.bloomComposer.setSize(w, h);
  }

  render() {
    const {renderer} = this;
    const color = renderer.getClearColor(new THREE.Color());

    renderer.setClearColor("#000000");
    this.checkItems();
    this.bloomComposer.render();
    this.restoreMaterials();
    renderer.setClearColor(color);
  }

  checkItems() {
    const {scene, restoreItems, changedMaterials} = this;
    restoreItems.length = 0;
    changedMaterials.length = 0;
    scene.prevFog = scene.fog;
    scene.fog = null;
    scene.traverse(child => {
      if (!child.material) return;
      if (Array.isArray(child.material)) {
        child.material.forEach((material, index) => {
          child.material[index] = this.changeMaterial(child, material, index);
        });
      } else
        child.material = this.changeMaterial(child, child.material, -1);
    });
  }

  changeMaterial(child, material, index) {
    const {restoreItems, blackMaterial, changedMaterials} = this;
    if (material.hasBloom) {
      if (material.envBloom) {
        changedMaterials.push({
          material
        });
        material.envMapSave = material.envMapSave || material.envMap;
        material.envMap = material.envBloom;
        material.bloomed = true;
        material.needsUpdate = true;
      }

      return material;
    }
    restoreItems.push({
      index, child, material
    });
    return blackMaterial;
  }

  restoreMaterials() {
    const {restoreItems, changedMaterials,scene} = this;

    scene.fog= scene.prevFog;
    restoreItems.forEach(({index, child, material}) => {
      if (index !== -1)
        child.material[index] = material;
      else
        child.material = material;
    });
    changedMaterials.forEach(({material}) => {
      ["envMap"].forEach((key) => {
        material[key] = material[`${key}Save`];
      });
      material.bloomed = false;
      material.needsUpdate = true;
    });
  }
}
