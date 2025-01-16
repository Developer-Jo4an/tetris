import * as dat from 'dat.gui';
import {decomposeMatrixWorld, linearize, smoothstep, toScreenPosition} from "../three-utils";
import {gsap} from "gsap";


export default class DOF extends THREE.Pass {
  constructor({camera, effectController, scene}) {
    super();
    this.needsSwap = false;
    this.scene = scene;
    this.camera = camera;
    this.effectControllerSettings = effectController;
    this.initPostProcessing()
  }


  initPostProcessing() {
    const {camera, effectControllerSettings} = this;
    const depthShader = THREE.BokehDepthShader;
    const shaderSettings = {
      rings: 3,
      samples: 4
    };
    this.shaderSettings = shaderSettings;
    const materialDepth = new THREE.ShaderMaterial({
      uniforms: depthShader.uniforms,
      vertexShader: depthShader.vertexShader,
      fragmentShader: depthShader.fragmentShader
    });
    materialDepth.uniforms['mNear'].value = 1;
    materialDepth.uniforms['mFar'].value = 3000;

    const postprocessing = {enabled: false};
    this.postprocessing = postprocessing;
    this.materialDepth = materialDepth;

    this.effectController = {
      ...effectControllerSettings,
      maxblur: 0,
      focalLength: camera.getFocalLength(),
    };

    postprocessing.scene = new THREE.Scene();

    postprocessing.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
    postprocessing.camera.position.z = 100;

    postprocessing.scene.add(postprocessing.camera);

    const pars = {minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat};
    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);
    postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, pars);

    const bokeh_shader = THREE.BokehShader;

    postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(bokeh_shader.uniforms);

    postprocessing.bokeh_uniforms['tColor'].value = postprocessing.rtTextureColor.texture;
    postprocessing.bokeh_uniforms['tDepth'].value = postprocessing.rtTextureDepth.texture;
    postprocessing.bokeh_uniforms['textureWidth'].value = window.innerWidth;
    postprocessing.bokeh_uniforms['textureHeight'].value = window.innerHeight;

    postprocessing.materialBokeh = new THREE.ShaderMaterial({

      uniforms: postprocessing.bokeh_uniforms,
      vertexShader: bokeh_shader.vertexShader,
      fragmentShader: bokeh_shader.fragmentShader,
      defines: {
        RINGS: shaderSettings.rings,
        SAMPLES: shaderSettings.samples
      }

    });

    postprocessing.quad = new THREE.Mesh(new THREE.PlaneGeometry(window.innerWidth, window.innerHeight), postprocessing.materialBokeh);
    postprocessing.quad.position.z = -500;
    postprocessing.scene.add(postprocessing.quad);

    if (DEBUG)
      this.initPostProcessingDebug();

    this.matChanger();
  }

  resize(width, height) {
    const {postprocessing} = this;
    postprocessing.rtTextureDepth.setSize(width, height);
    postprocessing.rtTextureColor.setSize(width, height);

    postprocessing.bokeh_uniforms['textureWidth'].value = width;
    postprocessing.bokeh_uniforms['textureHeight'].value = height;


    this.effectController.focalLength = this.camera.getFocalLength();
  }

  initPostProcessingDebug() {
    const {effectController, shaderSettings, matChanger, shaderUpdate} = this;
    const gui = new dat.GUI();

    gui.add(effectController, 'enabled').onChange(matChanger);
    gui.add(effectController, 'jsDepthCalculation').onChange(matChanger);
    gui.add(effectController, 'shaderFocus').onChange(matChanger);
    gui.add(effectController, 'focalDepth', 0.0, 3000.0).listen().onChange(matChanger);

    gui.add(effectController, 'fstop', 0.1, 1, 0.001).onChange(matChanger);
    gui.add(effectController, 'maxblur', 0.0, 5.0, 0.025).onChange(matChanger);

    gui.add(effectController, 'showFocus').onChange(matChanger);
    gui.add(effectController, 'manualdof').onChange(matChanger);
    gui.add(effectController, 'vignetting').onChange(matChanger);

    gui.add(effectController, 'depthblur').onChange(matChanger);

    gui.add(effectController, 'threshold', 0, 1, 0.001).onChange(matChanger);
    gui.add(effectController, 'gain', 0, 100, 0.001).onChange(matChanger);
    gui.add(effectController, 'bias', 0, 3, 0.001).onChange(matChanger);
    gui.add(effectController, 'fringe', 0, 5, 0.001).onChange(matChanger);

    gui.add(effectController, 'focalLength', 16, 80, 0.001).onChange(matChanger);

    gui.add(effectController, 'noise').onChange(matChanger);

    gui.add(effectController, 'dithering', 0, 0.001, 0.0001).onChange(matChanger);

    gui.add(effectController, 'pentagon').onChange(matChanger);

    gui.add(shaderSettings, 'rings', 1, 8).step(1).onChange(shaderUpdate);
    gui.add(shaderSettings, 'samples', 1, 13).step(1).onChange(shaderUpdate);

    global.addedGUI = gui;
  }

  shaderUpdate = () => {
    const {postprocessing, shaderSettings} = this;
    postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
    postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;
    postprocessing.materialBokeh.needsUpdate = true;
  };

  set enabled(enable) {
    const {postprocessing, effectController, effectControllerSettings} = this;
    if (!effectControllerSettings) return;
    const duration = 0.8;

    gsap.fromTo(effectController, {
      maxblur: enable ? 0 : effectControllerSettings.maxblur
    }, {
      duration,
      onStart: () => {
        if (enable) {
          postprocessing.enabled = enable;
          effectController.enabled = postprocessing.enabled;
        }
      },
      onComplete: () => {
        if (!enable) {
          postprocessing.enabled = enable;
          effectController.enabled = postprocessing.enabled;
        }
      },
      onUpdate: this.matChanger,
      ease: "sine.inOut",
      maxblur: enable ? effectControllerSettings.maxblur : 0
    })
  }

  get enabled() {
    return this.postprocessing.enabled;
  }

  render(renderer, writeBuffer, readBuffer) {
    const {scene} = this;
    const {postprocessing, materialDepth} = this;
    const oldAutoClear = renderer.autoClear;

    renderer.autoClear = false;
    renderer.clear();

    // render scene into texture

    renderer.setRenderTarget(postprocessing.rtTextureColor);
    renderer.clear();
    renderer.render(scene, this.camera);

    // render depth into texture

    scene.overrideMaterial = materialDepth;
    renderer.setRenderTarget(postprocessing.rtTextureDepth);
    renderer.clear();

    renderer.render(scene, this.camera);
    scene.overrideMaterial = null;

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    renderer.clear(true, true);
    renderer.render(postprocessing.scene, postprocessing.camera);

    renderer.autoClear = oldAutoClear;
  }

  setFocus(object, renderer, target = this.camera) {
    const {camera, postprocessing, effectController} = this;
    const screenPosition = toScreenPosition(object, camera, renderer);
    const {position} = decomposeMatrixWorld(object);
    const distance = position.distanceTo(target.position);

    postprocessing.bokeh_uniforms['focusCoords'].value.set(screenPosition.x, screenPosition.y);

    const sdistance = smoothstep(camera.near, camera.far, distance);

    const ldistance = linearize(1 - sdistance, camera);

    postprocessing.bokeh_uniforms['focalDepth'].value = ldistance;

    effectController['focalDepth'] = ldistance;
  }

  matChanger = () => {
    const {postprocessing, camera} = this;
    for (const e in this.effectController) {

      if (e in postprocessing.bokeh_uniforms) {
        postprocessing.bokeh_uniforms[e].value = this.effectController[e];
      }
    }

    postprocessing.enabled = this.effectController.enabled;
    postprocessing.bokeh_uniforms['znear'].value = camera.near;
    postprocessing.bokeh_uniforms['zfar'].value = camera.far;
    camera.setFocalLength(this.effectController.focalLength);
  };

}

THREE.DOF = DOF;
