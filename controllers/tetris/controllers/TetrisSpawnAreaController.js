import BaseTetrisController from "./BaseTetrisController";
import TetrisFactory from "../helpers/TetrisFactory";
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
    const cells = TetrisFactory.getCollectionByType("cell");
    const squares = TetrisFactory.getCollectionByType("square");

    const diff = cells.length - squares.length;

    const randomPercent = getRandomFromRange(0.25, 0.4);

    const squaresCount = Math.ceil(diff * randomPercent);

  }

  update(deltaTime) {

  }
}