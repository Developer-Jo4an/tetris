import BaseEntity from "./BaseEntity";
import Square from "./Square";
import {globalUtils} from "../utils/globalUtils";
import {GAME_SIZE} from "../TetrisController";

export default class SquaresGroupView extends BaseEntity {
  constructor(data) {
    super(data, "squaresGroupView");

    this.init(data.shape);
  }

  init(shapes) {
    const {levels, area} = this.storage.mainSceneSettings;

    const {grid} = levels[this.level];

    this.view = new PIXI.Container();
    this.view.name = `${this.name}-container`;

    this.shapes = (() => {
      const toNumberFormat = shapes.map(item => item.split(":").map(Number));
      const minX = Math.min(...toNumberFormat.map(pos => pos[0]));
      const minY = Math.min(...toNumberFormat.map(pos => pos[1]));
      return toNumberFormat.map(([x, y]) => [x - minX, y - minY]);
    })();

    const cellSize = globalUtils.getCellSize({gameSize: GAME_SIZE, grid, margin: area.margin});

    this.shapes.forEach(shape => {
      const id = "empty-empty";
      const square = new Square({
        id,
        level: this.level,
        name: `square:${id}`,
        storage: this.storage,
        eventBus: this.eventBus,
        size: cellSize
      });
      console.log(square);
    });
  }
}
