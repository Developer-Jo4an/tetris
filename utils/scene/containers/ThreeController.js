import Stats from "stats.js";
import {getIsDebug} from "../debug/getIsDebug";
import ThreeScene from "./ThreeScene";
import {exportGLTF} from "../utils/export/exportGLTF";
import SceneController from "./SceneController";
import Loader from "../loader/Loader";
import {threeManager} from "../loader/plugins/threejs/ThreeManager";
import ThreeParser from "../loader/plugins/postprocessing/ThreeParser";
import FPSMeter, {fpsMeter} from "../utils/fps-meter/fps-meter";

Loader.registerManager(threeManager, "threejs");

export default class ThreeController extends SceneController {

  debug = getIsDebug();

  clock = new THREE.Clock();

  stats;

  sceneSettings;

  rendererSettings;

  scenes = {};

  cameras = {};

  currentScene = null;

  currentCamera = null;

  constructor(data) {
    super(data);
    this.sceneSettings = data.scene;
    this.rendererSettings = data.renderer;

    this.onDecreaseStepChange = this.onDecreaseStepChange.bind(this);
    this.onResize = this.onResize.bind(this);
  }

  loadingSelect() {
    if (this.storage.createBefore)
      ThreeParser.createObjectsFromParams(this.storage.createBefore, {
        scene: this.currentScene
      });

    return Loader.load(this.storage.preload, {
      onProgress: ({itemsLoaded, itemsTotal}) => this.eventBus.dispatchEvent({
        type: "controller:loading-progress",
        data: {itemsLoaded, itemsTotal}
      }),
      onLoad: this.onLoad, externalData: {
        scene: this.currentScene
      }
    })
  }

  onDecreaseStepChange(step) {
  }


  init(isDispatch = true) {
    this.initStats();

    this.initRenderer();
    this.initScenes();
    this.initCameras();

    if (this.container)
      this.appendContainer(this.container);
  }

  initItems() {

  }

  create() {

    this.initItems();

    if (getIsDebug())
      this.initDebug();

    if (this.storage.sceneOverrides)
      ThreeParser.overrideObjects(this.currentScene,
        this.storage.sceneOverrides,
        {
          scene: this.currentScene
        });

    FPSMeter.listen(this.onDecreaseStepChange);
    fpsMeter.start();
    requestAnimationFrame(this.update);
  }

  initDebug() {

  }

  initCameras() {
    const {
      storage: {
        mainSceneSettings: {
          camera: cameraSettings,
        } = {}
      }
    } = this;
    this.currentCamera = this.cameras.main = this.initCamera(cameraSettings);
  }

  initCamera(cameraSettings = {}) {
    return new THREE.PerspectiveCamera(cameraSettings.fov ?? 30, cameraSettings.aspect || window.innerWidth / window.innerHeight, 0.1, cameraSettings.far || 10000);
  }

  initScenes() {
    this.currentScene = this.scenes.main = this.initScene("main");

    if (typeof window.__THREE_DEVTOOLS__ !== 'undefined') {
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', {detail: this.currentScene}));
      window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('observe', {detail: this.renderer}));
    }
  }

  initScene() {
    const {
      storage,
      eventBus,
      storage: {
        mainSceneSettings: {
          fog,
        } = {}
      },
      sceneSettings: {
        Cls = ThreeScene,
        options = {}
      } = {}
    } = this;

    return new Cls({eventBus, storage, fog, ...options})
  }

  initRenderer() {
    const {
      storage: {
        mainSceneSettings: {
          shadow,
          backgroundColor: sBackgroundColor,
        } = {}
      },
      rendererSettings: {
        shadowSettings = shadow,
        backgroundColor = (sBackgroundColor ?? "#cccccc"),
        backgroundTransparent = false,
        backgroundOpacity = 1,
        devicePixelRatio = window.devicePixelRatio,
        options = {antialias: true, logarithmicDepthBuffer: true}
      } = {}
    } = this;

    const renderer = this.renderer = new THREE.WebGLRenderer(options);

    //Выводить ошибки в шейдерах, для выигрыша по производительности на production версии отключаем
    renderer.debug.checkShaderErrors = this.debug;

    if (backgroundTransparent)
      renderer.setClearColor(backgroundColor, backgroundOpacity);
    else
      renderer.setClearColor(backgroundColor);

    renderer.setPixelRatio(devicePixelRatio);
    renderer.outputEncoding = THREE.sRGBEncoding;

    if (shadowSettings) {
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = shadowSettings?.type ?? THREE.PCFShadowMap;
    }
  }

  appendContainer(container) {
    if (this.renderer) {
      container.innerHTML = "";
      container.appendChild(this.renderer.domElement);
    }

    super.appendContainer(container);
  }

  get canvas() {
    return this.renderer?.domElement;
  }

  onResize({width, height} = this._size) {
    if (!this.renderer.domElement.parentElement) return;
    const {renderer} = this;

    this._size = {width, height};

    Object.values(this.cameras).forEach(camera => {
      camera.aspect = width / height;

      camera.updateProjectionMatrix();
    });

    Object.values(this.scenes).forEach(scene => scene.resize(width, height));


    renderer.setSize(width, height);
  }

  initStats() {
    const stats = this.stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    if (this.debug)
      document.body.appendChild(stats.domElement);
  }

  exportGLTF(params) {
    return exportGLTF(this.currentScene, params)
  }

  render() {
    const {currentScene, currentCamera, renderer} = this;
    renderer.render(currentScene, currentCamera);
  }

  update() {
    if (this.stats) this.stats.end();
    (performance || Date).now();

    const {clock, currentScene} = this;
    const delta = clock.getDelta();

    currentScene.update(delta);

    this.render();

    if (this.stats) this.stats.begin();

    (performance || Date).now();

    return delta;
  }
}
