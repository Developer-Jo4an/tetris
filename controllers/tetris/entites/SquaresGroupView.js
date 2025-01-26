import BaseEntity from "./BaseEntity";
import Square from "./Square";
import {globalUtils} from "../utils/globalUtils";
import {GAME_SIZE} from "../TetrisController";

export default class SquaresGroupView extends BaseEntity {
  constructor(data) {
    super(data, "squaresGroupView");

    this.startShapes = data.shape;
    this.squares = [];

    this.init();
  }

  init() {
    const {levels, area} = this.storage.mainSceneSettings;

    const {grid} = levels[this.level];

    this.view = new PIXI.Container();
    this.view.name = `${this.name}-container`;

    this.shapes = (() => {
      const toNumberFormat = this.startShapes.map(item => item.split(":").map(Number));
      const minX = Math.min(...toNumberFormat.map(pos => pos[0]));
      const minY = Math.min(...toNumberFormat.map(pos => pos[1]));
      return toNumberFormat.map(([x, y]) => [x - minX, y - minY]);
    })();

    const cellSize = globalUtils.getCellSize({gameSize: GAME_SIZE, grid, margin: area.margin});

    this.shapes.forEach((shape, index) => {
      const [xMultiplier, yMultiplier] = shape;
      const id = `${xMultiplier}-${yMultiplier}${!index ? "-leading" : ""}`;

      const square = new Square({
        id,
        level: this.level,
        name: `square:${id}`,
        storage: this.storage,
        stage: this.stage,
        eventBus: this.eventBus,
        size: cellSize
      });

      this.squares.push(square);

      square.view.position.set(yMultiplier * cellSize + cellSize / 2, xMultiplier * cellSize + cellSize / 2);

      this.view.addChild(square.view);
    });

    this.view.pivot.set(this.view.width / 2, this.view.height / 2);

    this.hitArea = new PIXI.Graphics();
    this.hitArea.name = "hitArea";
    this.hitArea.beginFill(0x00ff00, 0.1);
    this.hitArea.drawRect(0, 0, this.view.width, this.view.height);
    this.hitArea.endFill();

    this.view.addChild(this.hitArea);
  }

  setSelectionScale(scale) {
    this.selectionScale = scale;
    this.view.scale.set(this.selectionScale);
  }

  setInteractive(isInteractive) {
    this.view.interactive = isInteractive;

    const method = isInteractive ? "on" : "off";

    this.view[method]("pointerdown", this.onStart);
    this.view[method]("pointermove", this.onMove);
    this.view[method]("pointerup", this.onEnd);
    this.view[method]("pointerupoutside", this.onEnd);
  }

  onStart = e => {
    if (this.isEnding) return;

    this.isDragging = true;
    this.setActive(true);
    const {x, y} = e.data.global;
    this.startPosition = {x: this.view.x, y: this.view.y};
    this.movePosition = {x, y};
  };

  onMove = e => {
    if (!this.isDragging) return;

    const {x, y} = e.data.global;
    const [xDiff, yDiff] = [x - this.movePosition.x, y - this.movePosition.y].map(diff => diff / this.stage.scale.x);
    this.movePosition = {x, y};
    this.view.position.set(this.view.x + xDiff, this.view.y + yDiff);
  };

  onEnd = e => {
    if (!this.isDragging) return;

    this.isEnding = true;
    this.isDragging = false;

    const scaleTweenPromise = this.setActive(false);

    const positionTweenPromise = new Promise(res =>
      gsap.to(this.view, {
        x: this.startPosition.x,
        y: this.startPosition.y,
        duration: 0.2,
        ease: "sine.inOut",
        onComplete: res
      }));

    Promise.all([scaleTweenPromise, positionTweenPromise]).then(this.clearDraggingData.bind(this));
  };

  clearDraggingData() {
    this.isEnding = false;
    this.startPosition = null;
    this.movePosition = null;
  }

  setActive(isActive) {
    const timeline = gsap.timeline();

    timeline
    .to(this.view.scale, {
      x: isActive ? 1 : this.selectionScale,
      y: isActive ? 1 : this.selectionScale,
      duration: 0.1,
      ease: "sine.inOut"
    })
    .to(this.hitArea, {
      alpha: +!isActive,
      duration: 0.1,
      ease: "sine.inOut"
    }, 0);

    return new Promise(res => timeline.eventCallback("onComplete", res));
  }
}
