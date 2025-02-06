import BaseTetrisController from "./BaseTetrisController";

export default class TetrisGameController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.win = this.win.bind(this);
    this.lose = this.lose.bind(this);
    this.currentPointsAdd = this.currentPointsAdd.bind(this);

    this.timeoutTween = null;
    this.targetPoints = Number.MAX_VALUE;
    this.currentPoints = 0;

    this.init();
  }

  init() {
    this.initTimeout();
    this.initTargetPoints();
    this.initEvents();
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
      },
      onComplete: () => {
        this.lose();
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

  initEvents() {
    this.eventBus.addEventListener("currentPoints:add", this.currentPointsAdd);
    this.eventBus.addEventListener("game:win", this.win);
    this.eventBus.addEventListener("game:lose", this.lose);
  }

  currentPointsAdd({addCount}) {
    this.currentPoints = Math.min(this.currentPoints + addCount, this.targetPoints);

    this.eventBus.dispatchEvent({type: "currentPoints:update", updatedCount: this.currentPoints});

    if (this.currentPoints === this.targetPoints)
      this.eventBus.dispatchEvent({type: "game:win"});
  }

  win() {
    //todo: win
  }

  lose() {
    //todo: lose
  }

  playingSelect() {
    if (this.timeoutTween)
      this.timeoutTween.play();
  }
}