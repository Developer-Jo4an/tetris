import BaseTetrisController from "./BaseTetrisController";

export default class TetrisGameController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.timeoutTween = null;
  }

  init() {
    this.initTimeout();
    this.initTargetPoints();
  }

  initTimeout() {
    const {gameData: {timeout}} = this.storage.mainSceneSettings.levels[this.level.value];

    if (typeof timeout !== "number") return;

    this.eventBus.dispatchEvent({type: "timeout:update", remainder: timeout});

    const self = this;

    let currentTime = timeout;

    this.timeoutTween = gsap.to({}, {
      duration: timeout,
      onUpdate: function () {
        const progress = this.progress();
        const remainder = Math.ceil(timeout - progress * timeout);
        if (currentTime !== remainder) {
          currentTime = remainder;
          self.eventBus.dispatchEvent({type: "timeout:update", remainder});
        }
      }
    });

    this.timeoutTween.pause();
  }

  initTargetPoints() {
    const {gameData: {targetPoints}} = this.storage.mainSceneSettings.levels[this.level.value];

    if (typeof targetPoints !== "number") return;

    this.targetPoints = targetPoints;

    this.eventBus.dispatchEvent({type: "targetPoints:update", targetPoints});
  }

  playingSelect() {
    if (this.timeoutTween) this.timeoutTween.play();
  }
}