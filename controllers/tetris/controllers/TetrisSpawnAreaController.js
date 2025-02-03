import BaseTetrisController from "./BaseTetrisController";
import TetrisContainer from "../helpers/TetrisContainer";
import {getRandomFromRange, getRandomIntFromRange} from "../../../utils/data/random/getRandomFromRange";
import SquaresGroupView from "../entites/SquaresGroupView";
import {GAME_SIZE} from "../TetrisController";

const utils = {};

const constants = {
  directions: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]],
  ranges: [[4, 2], [8, 3], [12, 4]]
};

export default class TetrisSpawnAreaController extends BaseTetrisController {
  step = 0;

  constructor(data) {
    super(data);

    this.stepped = this.stepped.bind(this);

    this.init();
  }

  init() {
    this.squaresGroupArea = new PIXI.Container();
    this.squaresGroupArea.name = "spawnArea";
    this.initEvents();
  }

  initEvents() {
    this.eventBus.addEventListener("step:stepped", this.stepped);
  }

  playingSelect() {
    this.generateSquaresGroupArray();
  }

  generateSquaresGroupArray() { //todo: если можно использовать worker, то использовать, так как метод может очень долго генерить
    const {grid} = this.storage.mainSceneSettings.levels[this.level.value];

    const {rows, columns} = grid.reduce((acc, {cells}) => {
      return {...acc, columns: Math.max(cells.length, acc.columns)};
    }, {columns: 0, rows: grid.length});

    const cells = TetrisContainer.getCollectionByType("cell");
    const squares = TetrisContainer.getCollectionByType("square");

    const diff = cells.length - squares.length;

    const randomPercent = getRandomFromRange(0.25, 0.4);

    const squaresCount = Math.ceil(diff * randomPercent);

    const shapesCount = (() => {
      const copiedRanges = structuredClone(constants.ranges).reverse();

      const necessaryRange = copiedRanges?.reduce((acc, [max, count]) => {
        return squaresCount >= max && acc < count ? count : acc;
      }, 1);

      return getRandomIntFromRange(1, necessaryRange);
    })();

    const shapesFormCombinations = (() => {
      const result = [];

      const backtrack = (current, remaining, count) => {
        if (count === shapesCount) {
          !remaining && result.push([...current]);
          return;
        }
        const start = current.length ? current[current.length - 1] : 1;
        for (let i = start; i <= remaining; i++) {
          current.push(i);
          backtrack(current, remaining - i, count + 1);
          current.pop();
        }
      };

      backtrack([], squaresCount, 0);

      return result;
    })();

    const possibleFigures = (() => {
      const formattedCells = cells.reduce((acc, cell) => {
        const {row, column} = cell.getPosById();
        if (!acc[row]) acc[row] = [];
        acc[row][column] = cell;
        return acc;
      }, []);

      const allShapes = [];

      const isCellEmpty = cell => !Boolean(cell.view.getChildByName(`square:${cell.id}-sprite`));

      const isValid = (x, y) => (
        x >= 0 && y >= 0 &&
        x < rows && y < columns &&
        isCellEmpty(formattedCells[x][y])
      );

      const buildShape = (shape, visited, x, y) => {
        if (shape.length > squaresCount) return;

        allShapes.push([...shape]);

        for (const [dx, dy] of constants.directions) {
          const newX = x + dx;
          const newY = y + dy;
          if (isValid(newX, newY) && !visited.has(`${newX}:${newY}`)) {
            visited.add(`${newX}:${newY}`);
            shape.push(`${newX}:${newY}`);
            buildShape(shape, visited, newX, newY);
            shape.pop();
            visited.delete(`${newX}:${newY}`);
          }
        }
      };

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          if (isCellEmpty(formattedCells[row][col])) {
            const visited = new Set();
            visited.add(`${row}:${col}`);
            buildShape([`${row}:${col}`], visited, row, col);
          }
        }
      }
      const shiftCount = Math.floor(Math.random() * allShapes.length);

      return [...allShapes.slice(0, shiftCount), ...allShapes.slice(shiftCount)];
    })();

    const necessaryShapes = [];

    while (necessaryShapes.length !== shapesCount && shapesFormCombinations.length) {
      necessaryShapes.length = 0;

      const randomIndex = getRandomIntFromRange(0, shapesFormCombinations.length - 1);
      const value = shapesFormCombinations.splice(randomIndex, 1)[0];

      value.forEach(shapeLength => {
        if (necessaryShapes.length === shapesCount) return;

        const usedShapes = necessaryShapes.reduce((acc, figure) => [...acc, ...figure], []);

        const necessaryFigure = possibleFigures.find(figure => {
          return figure.length === shapeLength && !figure.some(subShape => usedShapes.includes(subShape));
        });

        if (necessaryFigure)
          necessaryShapes.push(necessaryFigure);
      });
    }

    const callbackKey = `generateSquaresGroup${necessaryShapes.length !== shapesCount ? "Array" : "View"}`;

    this[callbackKey]?.(necessaryShapes);
  }

  generateSquaresGroupView(shapes) {
    const {spawnArea: {distanceBetweenArea}, area: {margin}} = this.storage.mainSceneSettings;

    const cells = TetrisContainer.getCollectionByType("cell");

    shapes.forEach((shape, index) => {
      const id = `${this.step}:${index}`;
      new SquaresGroupView({
        id,
        shape,
        level: this.level,
        stage: this.stage,
        storage: this.storage,
        eventBus: this.eventBus,
        name: `squaresGroupView:${id}`,
      });
    });

    const shapeGroups = TetrisContainer.getCollectionByType("squaresGroupView");

    const tetrisAreaHeight = cells[0].view.parent.height;
    const maxHeight = GAME_SIZE.height - tetrisAreaHeight - distanceBetweenArea;
    const maxWidth = GAME_SIZE.width - margin * GAME_SIZE.width * 2;

    const minScale = shapeGroups.reduce((acc, shapeGroup, _, arr) => {
      const {view} = shapeGroup;
      const scaleHeight = maxHeight / view.height;
      const scaleWidth = ((maxWidth / arr.length) - ((arr.length - 1) * (margin * GAME_SIZE.width))) / view.width;
      const scale = Math.min(scaleHeight, scaleWidth);
      return Math.min(scale, acc);
    }, Number.MAX_VALUE);

    shapeGroups.forEach((shapeGroup, index, arr) => {
      const {view} = shapeGroup;
      shapeGroup.setSelectionScale(minScale);
      const prevEls = arr.slice(0, index);
      const x = prevEls.reduce((acc, {view}) => acc + view.width + margin * GAME_SIZE.width, view.width / 2);
      const y = view.height / 2;
      view.position.set(x, y);
      this.squaresGroupArea.addChild(view);
      view.alpha = 0;
    });

    shapeGroups.forEach(({view}) => view.position.y = this.squaresGroupArea.height / 2);

    this.squaresGroupArea.pivot.set(this.squaresGroupArea.width / 2, 0);
    this.squaresGroupArea.position.set(GAME_SIZE.width / 2, tetrisAreaHeight + distanceBetweenArea);

    this.stage.addChild(this.squaresGroupArea);

    const shapeViews = shapeGroups.map(({view}) => view);

    gsap.to(shapeViews, {
      alpha: 1,
      duration: 0.3,
      ease: "sine.out",
      onComplete: () => {
        shapeGroups.forEach(shapeGroup => shapeGroup.setInteractive(true));
      }
    });
  }

  setInteractiveShapes(isInteractive) {
    const shapeGroups = TetrisContainer.getCollectionByType("squaresGroupView");
    shapeGroups.forEach(shape => shape.setInteractive(isInteractive));
  }

  async stepped() {
    const shapeGroups = TetrisContainer.getCollectionByType("squaresGroupView");

    this.setInteractiveShapes(false);

    await this.checkOnAddPoints();

    shapeGroups.length
      ? this.setInteractiveShapes(true)
      : this.generateSquaresGroupArray();
  }

  checkOnAddPoints() {
    const cells = TetrisContainer.getCollectionByType("cell");

    const fullRowsCellIds = this.checkColumnOrRow("row");
    const fullColumnsCellIds = this.checkColumnOrRow("column");

    const allUniqSquares = [...new Set([...fullColumnsCellIds, ...fullRowsCellIds])];

    return Promise.resolve();
  }

  checkColumnOrRow(side) {
    const cells = TetrisContainer.getCollectionByType("cell").reduce((acc, cell) => {
      const {row, column} = cell.getPosById();
      if (!acc[row]) acc[row] = [];
      acc[row][column] = cell;
      return acc;
    }, []);

    const length = side === "row" ? cells.length : cells[0].length;

    const completed = [];

    for (let counter = 0; counter < length; counter++) {
      let isSideComplete = true;

      const subLength = side === "row" ? cells[counter].length : cells.length;

      for (let subCounter = 0; subCounter < subLength; subCounter++) {
        const [index, subIndex] = [side === "row" ? counter : subCounter, side === "row" ? subCounter : counter];

        const necessaryCell = cells[index][subIndex];

        if (!necessaryCell.getSquare()) {
          isSideComplete = false;
          break;
        }
      }

      if (isSideComplete)
        ({
          row: () => {
            try {
              completed.push(...(cells[counter].map(cell => cell.id)));

            } catch (e) {
              console.log(counter);
              console.log(cells);
              debugger
            }
          },
          column: () => {
            for (let row = 0; row < cells.length; row++)
              completed.push(cells[row][counter].id);
          }
        })[side]();
    }

    return completed;
  }

  update(deltaTime) {
  }
}
