import "../libs/babylon.glTFFileLoader";
import SceneController from "./SceneController";
import {Engine, Scene} from "babylonjs";
import Loader from "../loader/Loader";
import {babylonManager} from "../loader/plugins/babylon/BabylonManager";

Loader.registerManager(babylonManager, "babylon");

export default class BabylonController extends SceneController {

  constructor(data) {
    super(data);
  }

  loadingSelect() {
    return Loader.load(this.storage.preload, {
      onLoad: this.onLoad, externalData: {
        scene: this.scene
      }
    })
  }

  init() {
    const {
      storage: {
        mainSceneSettings: {
          engineOptions = {}
        }
      },
      storage
    } = this;

    const canvas = document.createElement("canvas");
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.setAttribute("width", "100%");
    canvas.setAttribute("height", "100%");

    this.canvas = canvas;

    const engine = new Engine(canvas, true, engineOptions, true);
    const scene = new Scene(engine);


    storage.sceneData.scene = this.scene = scene;
    storage.sceneData.engine = this.engine = engine;
    storage.sceneData.canvas = this.canvas = canvas;

    engine.runRenderLoop(this.update);

    this.initCamera();
    this.initLight();
    this.initBaseItems();

    if (this.container)
      this.appendContainer(this.container);
  }

  appendContainer(container) {
    if (this.canvas)
      container.appendChild(this.canvas);

    super.appendContainer(container);
  }


  update() {
    super.update();
    const {scene} = this;

    scene.render();
  }

  resize() {
    this.engine.resize();
  }

  initCamera() {
    const {canvas, scene} = this;
    const camera = new BABYLON.FreeCamera("mainCamera", new BABYLON.Vector3(0, 5, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
  }

  initLight() {
    const {scene} = this;
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
  }

  initBaseItems() {
    BABYLON.MeshBuilder.CreateGround("ground", {width: 6, height: 6}, this.scene);
  }
}
