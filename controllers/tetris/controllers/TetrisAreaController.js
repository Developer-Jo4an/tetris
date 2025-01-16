import BaseTetrisController from "./BaseTetrisController";
import {GAME_SIZE} from "../TetrisController";
import Cell from "../entites/Cell";
import TetrisFactory from "../helpers/TetrisFactory";
import TetrsFactory from "../helpers/TetrisFactory";

const utils = {
  getCellPos: (cellSize, axes) => {
    return (axes * cellSize) + (cellSize / 2);
  },
  shuffle: arr => {
    return arr
    .map(value => ({value, sort: Math.random()}))
    .sort((a, b) => a.sort - b.sort)
    .map(({value}) => value);
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
        eventBus: this.eventBus,
        name: `cell:${id}`,
      });

      const [x, y] = [pos, str].map(axes => utils.getCellPos(cellSize, axes));

      cellItem.view.position.set(x, y);

      cellItem.view.alpha = 0;

      gridContainer.addChild(cellItem.view);
    }));

    gridContainer.position.x = (GAME_SIZE.width - gridContainer.width) / 2;

    TetrisFactory.getCollectionByType("cell").forEach(cell => cell.view.scale.set(0));

    this.stage.addChild(gridContainer);
  }

  showingSelect() {
    const {levels} = this.storage.mainSceneSettings;

    const {startHidePercent} = levels[this.level];

    const cells = TetrisFactory.getCollectionByType("cell");

    const shuffledCells = utils.shuffle(cells);

    const {shuffledViews, shuffledScales} = shuffledCells.reduce((acc, {view}) => {
      acc.shuffledViews.push(view);
      acc.shuffledScales.push(view.scale);
      return acc;
    }, {shuffledViews: [], shuffledScales: []});

    const hideSquaresCount = Math.floor(startHidePercent * cells?.length);

    const hideSquares = (() => {
      const arr = [];
      const squares = TetrsFactory.getCollectionByType("square");

      while (arr.length < hideSquaresCount) {
        const randomEl = squares[Math.floor(Math.random() * squares.length)];

        if (!arr.includes(randomEl))
          arr.push(randomEl);
      }

      return arr;
    })();

    const showingTimeline = gsap.timeline();

    showingTimeline
    .to(shuffledViews, {
      alpha: 1,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut"
    })
    .to(shuffledScales, {
      x: 1, y: 1,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut"
    })
    .to(hideSquares.map(square => square.view), {
      alpha: 0,
      delay: i => i * 0.01,
      duration: 0.2,
      ease: "ease.inOut",
      onComplete: () => {
        hideSquares.forEach(square => square.destroy());
      }
    });

    return new Promise(res => showingTimeline.eventCallback("onComplete", res));
  }

  playingSelect() {

  }

  update(milliseconds, deltaTime) {

  }
}
