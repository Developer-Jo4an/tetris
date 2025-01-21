import BaseTetrisController from "./BaseTetrisController";
import TetrisContainer from "../helpers/TetrisContainer";
import {getRandomFromRange} from "../../../utils/data/random/getRandomFromRange";

const utils = {};

export default class TetrisSpawnAreaController extends BaseTetrisController {
  constructor(data) {
    super(data);
  }

  init() {

  }

  playingSelect() {
    this.generateSquaresGroup();
  }

  generateSquaresGroup() {
    const {grid} = this.storage.mainSceneSettings.levels[this.level];

    const {strings, columns} = grid.reduce((acc, {cells}) => {
      return {...acc, columns: Math.max(cells.length, acc.columns)};
    }, {columns: 0, strings: grid.length});

    const cells = TetrisContainer.getCollectionByType("cell");
    const squares = TetrisContainer.getCollectionByType("square");

    const diff = cells.length - squares.length;

    const randomPercent = getRandomFromRange(0.25, 0.4);

    const squaresCount = Math.ceil(diff * randomPercent);

    const createPossibleFigures = (() => {
      const emptyCells = cells.reduce((acc, cell) => {
        const squareKey = `square:${cell.id}-sprite`;
        const squareInside = cell.view.getChildByName(squareKey);
        if (!squareInside) acc.push(cell);
        return acc;
      }, []);

      emptyCells.forEach(cell => {

      });
    })();
  }

  update(deltaTime) {

  }
}