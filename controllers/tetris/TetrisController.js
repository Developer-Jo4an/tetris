import PixiController from "../../utils/scene/containers/PixiController";
import TetrisAreaController from "./controllers/TetrisAreaController";
import TetrisSquaresController from "./controllers/TetrisSquaresController";
import TetrisSpawnAreaController from "./controllers/TetrisSpawnAreaController";
import TetrisGameController from "./controllers/TetrisGameController";

export const GAME_SIZE = {width: 700, height: 1100};

export default class TetrisController extends PixiController {

  static CONTROLLERS = [
    TetrisGameController,
    TetrisAreaController,
    TetrisSquaresController,
    TetrisSpawnAreaController
  ];

  controllers = [];

  constructor(data) {
    super(data);

    this.update = this.update.bind(this);
  }

  loadManifestSelect() {
    return !this.isLoadedManifest && super.loadManifestSelect().then(() => this.isLoadedManifest = true);
  }

  loadingSelect() {
    return !this.isLoaded && super.loadingSelect().then(() => this.isLoaded = true);
  }

  initializationSelect() {
    this.initControllers();
    this.app.ticker.add(this.update);
  }

  pauseSelect() {
    this.setPause(true);
  }

  playingSelect() {
    this.setPause(false);
  }

  setPause(isPause) {
    gsap.globalTimeline[isPause ? "pause" : "play"]();
    this.app.ticker[isPause ? "stop" : "start"]();
  }

  initControllers() {
    const {eventBus, renderer, canvas, stage, storage, state, level} = this;
    const controllerData = {eventBus, renderer, canvas, stage, storage, state, level};
    this.controllers = TetrisController.CONTROLLERS.map(ControllerCls => new ControllerCls(controllerData));
  }

  setLevel(level) {
    if (this.level) {
      this.level.value = level;
      return;
    }

    this.level = {value: level};
  }

  update(deltaTime) {
    const milliseconds = deltaTime * (1000 / 60);
    this.controllers.forEach(controller => controller?.update?.(milliseconds, deltaTime));
  }

  onResize({width, height} = this._size) {
    super.onResize({width, height});
    this._size = {width, height};
    const scale = Math.min(width / GAME_SIZE.width, height / GAME_SIZE.height);
    this.stage.scale.set(scale);
    this.stage.position.set(
      (width - GAME_SIZE.width * scale) / 2,
      (height - GAME_SIZE.height * scale) / 2
    );
  }

  reset() {
    this.app.ticker.stop();
    gsap.globalTimeline.play();
    this.controllers.forEach(controller => controller.reset());
  }
}
