import BaseTetrisController from "./BaseTetrisController";
import {GAME_SIZE} from "../TetrisController";
import Cell from "../entites/Cell";
import TetrisFactory from "../helpers/TetrisFactory";

const utils = {
  getCellPos: (cellSize, axes) => {
    return (axes * cellSize) + (cellSize / 2);
  }
};

export default class TetrisAreaController extends BaseTetrisController {

  constructor(data) {
    super(data);
  }

  init() {
    const {levels, area} = this.storage.mainSceneSettings;

    const {grid} = levels[this.level];

    const marginFromEdge = GAME_SIZE.width * area.margin;

    const cellSize = (() => {
      const maxStringLength = grid.reduce((acc, {cells}) => Math.max(cells.length, acc), 0);
      const maxValue = Math.max(maxStringLength, grid.length);
      return (GAME_SIZE.width - 2 * marginFromEdge) / maxStringLength/*maxValue*/;
    })();

    // cell: true | false | "empty": true - непустая, false - отсутствие, empty - пустая

    const gridContainer = new PIXI.Container();

    gridContainer.name = "gridArea";

    grid.forEach(({cells}, str) => cells.forEach((cell, pos) => {
      if (!cell) return;

      const id = `${str}-${pos}`;

      const cellItem = new Cell({
        id: `${str}-${pos}`,
        isEmpty: cell === "empty",
        size: cellSize,
        storage: this.storage,
        name: `cell:${id}`
      });

      TetrisFactory.setItemByType("cell", cellItem);

      const [x, y] = [pos, str].map(axes => utils.getCellPos(cellSize, axes));

      cellItem.view.position.set(x, y);

      cellItem.view.alpha = 0;

      gridContainer.addChild(cellItem.view);
    }));

    gridContainer.position.x = (GAME_SIZE.width - gridContainer.width) / 2;

    this.stage.addChild(gridContainer);
  }

  showingSelect() {

  }

  update(milliseconds, deltaTime) {

  }
}