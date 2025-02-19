import BaseTetrisController from "./BaseTetrisController";
import {GAME_SIZE} from "../TetrisController";
import Cell from "../entites/Cell";
import TetrisContainer from "../helpers/TetrisContainer";
import {globalUtils} from "../utils/globalUtils";
import {shuffle} from "../../../utils/scene/utils/random/shuffle";
import BaseEntity from "../entites/BaseEntity";

const utils = {
  getCellPos: (cellSize, axes) => {
    return (axes * cellSize) + (cellSize / 2);
  }
};

export default class TetrisAreaController extends BaseTetrisController {

  constructor(data) {
    super(data);

    this.init();
  }

  init() {
    const {levels, area} = this.storage.mainSceneSettings;

    const {grid} = levels[this.level.value];

    const cellSize = globalUtils.getCellSize({gameSize: GAME_SIZE, grid, margin: area.margin});

    // cell: true | false | "empty": true - непустая, false - отсутствие, empty - пустая

    const gridContainer = new PIXI.Container();

    gridContainer.name = "gridArea";

    grid.forEach(({cells, alignItems}, str) => cells.forEach((cell, pos) => {
      const id = `${str}-${pos}`;

      const cellItem = new Cell({
        id,
        level: this.level,
        status: ({"false": "dontExist", "empty": "empty", "true": "standard"})[cell],
        size: cellSize,
        storage: this.storage,
        stage: this.stage,
        eventBus: this.eventBus,
        name: `cell:${id}`,
      });

      const [x, y] = [pos, str].map(axes => utils.getCellPos(cellSize, axes));

      cellItem.view.position.set(x, y);

      cellItem.view.alpha = 0;

      gridContainer.addChild(cellItem.view);
    }));

    gridContainer.position.x = (GAME_SIZE.width - gridContainer.width) / 2;

    TetrisContainer.getCollectionByType("cell").forEach(cell => cell.view.scale.set(0));

    this.stage.addChild(gridContainer);
  }

  showingSelect() {
    const {levels} = this.storage.mainSceneSettings;

    const {startHideCellsMultiplier} = levels[this.level.value];

    const cells = TetrisContainer.getCollectionByType("cell");

    const shuffledCells = shuffle([...cells]);

    const {shuffledViews, shuffledScales} = shuffledCells.reduce((acc, cell) => {
      cell.isVisibleCell && acc.shuffledViews.push(cell.view);
      acc.shuffledScales.push(cell.view.scale);
      return acc;
    }, {shuffledViews: [], shuffledScales: []});

    const hideSquaresCount = Math.floor(startHideCellsMultiplier * cells?.length);

    const hideSquares = (() => {
      const arr = [];
      const squares = TetrisContainer.getCollectionByType("square");

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
