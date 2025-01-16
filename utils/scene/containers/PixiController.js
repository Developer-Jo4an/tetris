import SceneController from "./SceneController";
import Loader from "../loader/Loader";
import {pixiManager} from "../loader/plugins/pixi/PixiManager";

Loader.registerManager(pixiManager, "pixijs");

export default class PixiController extends SceneController {

  constructor(data) {
    super(data);

    this.applicationSettings = data.applicationSettings ?? {};

    this.onResize = this.onResize.bind(this);
  }

  loadingSelect() {
    return Loader.load(this.storage.preload, {
      onLoad: this.onLoad, externalData: {
        stage: this.stage
      }
    })
  }

  onResize({width, height}) {
    const {renderer} = this;

    renderer.resize(width, height);
  }

  get renderer() {
    return this.app?.renderer;
  }

  get canvas() {
    return this.app?.renderer?.view;
  }

  get stage() {
    return this.app.stage;
  }

  appendContainer(container) {
    if (this.renderer)
      container.appendChild(this.canvas);

    super.appendContainer(container);
  }

  init() {
    super.init();

    this.initApplication();

    if (this.container)
      this.appendContainer(this.container);
  }

  initApplication() {
    const {applicationSettings} = this;
    this.app = new PIXI.Application(
      Object.assign(
        {
          transparent: false,
          backgroundColor: applicationSettings.backgroundColor ?? 0xffffff,
          resolution: window.devicePixelRatio,
          autoResize: true,
          antialias: true
        },
        applicationSettings
      )
    );

    globalThis.__PIXI_APP__ = this.app;
  }
}
