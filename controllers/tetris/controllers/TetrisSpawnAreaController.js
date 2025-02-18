import BaseTetrisController from "./BaseTetrisController";
import TetrisContainer from "../helpers/TetrisContainer";
import {getRandomFromRange} from "../../../utils/data/random/getRandomFromRange";
import SquaresGroupView from "../entites/SquaresGroupView";
import {GAME_SIZE} from "../TetrisController";
import {shuffle} from "../../../utils/scene/utils/random/shuffle";

const utils = {
  generateNumberPairs: (count, partials) => {
    const result = [];

    const backtrack = (current, remaining, count) => {
      if (count === partials) {
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

    backtrack([], count, 0);

    return result;
  }
};

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

  isCellEmpty(cell) {
    return cell && !cell.isDisabledCell && !Boolean(cell.getSquare());
  }

  cellsToGrid() {
    const cells = TetrisContainer.getCollectionByType("cell");
    return cells.reduce((acc, cell) => {
      const {row, column} = cell.getPosById();
      if (!acc[row]) acc[row] = [];
      acc[row][column] = cell;
      return acc;
    }, []);
  }

  generateSquaresGroupArray() {
    const cells = TetrisContainer.getCollectionByType("cell");
    const squares = TetrisContainer.getCollectionByType("square");

    const percentSquareCount = Math.ceil((cells.length - squares.length) * getRandomFromRange(0.25, 0.4));  //todo: в константы разброс

    const shapesCounts = shuffle(constants.ranges.reduce((acc, [minCount, squareCount]) =>
        percentSquareCount >= minCount ? [...acc, squareCount] : acc
      , [1]));

    const totalShapes = [];

    const grid = this.cellsToGrid();

    shapesCounts.forEach(count => {
      if (totalShapes.length) return;

      const allShapeCombinations = utils.generateNumberPairs(percentSquareCount, count);

      let isPossibleCombination = false;

      const shuffledCombinations = shuffle([...allShapeCombinations]);

      shuffledCombinations.forEach(combination => {
        if (isPossibleCombination) return;

        const shuffledCells = shuffle([...cells]);

        const reservedShapes = [];

        let isNecessaryFigure = true;

        const shuffleCombination = shuffle([...combination]);

        shuffleCombination.forEach(shapeCount => {
          if (!isNecessaryFigure) return;

          const shapeArr = [];

          reservedShapes.push(shapeArr);

          const checkOnComplete = () => shapeArr?.length === shapeCount;

          let isPossibleShape = false;

          shuffledCells.forEach(cell => {
            if (!this.isCellEmpty(cell) || isPossibleShape) return;

            const cellPosition = cell.getPosById();

            const recurse = ({row, column}) => {
              if (checkOnComplete()) return;

              const allFigures = reservedShapes.flat(Number.MAX_VALUE);

              const cellId = `${row}-${column}`;

              if (!allFigures.includes(cellId))
                shapeArr.push(cellId);

              const shuffledDirections = shuffle([...constants.directions]);

              shuffledDirections.forEach(([y, x]) => {
                if (checkOnComplete()) return;
                const [modifiedY, modifiedX] = [y + row, x + column];
                const necessaryCell = grid[modifiedY]?.[modifiedX];
                const id = `${modifiedY}-${modifiedX}`;
                if (this.isCellEmpty(necessaryCell) && !reservedShapes.flat(Number.MAX_VALUE).includes(id))
                  recurse({row: modifiedY, column: modifiedX});
              });
            };

            recurse(cellPosition);

            const cellResult = checkOnComplete();

            cellResult ? (isPossibleShape = true) : (shapeArr.length = 0);
          });

          if (!isPossibleShape) isNecessaryFigure = false;
        });

        if (isNecessaryFigure) {
          totalShapes.push(...reservedShapes);
          isPossibleCombination = true;
        }
      });

      if (!isPossibleCombination)
        this.generateSquaresGroupArray();
    });

    this.generateSquaresGroupView(totalShapes);
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
        name: `squaresGroupView:${id}`
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

    const isLose = shapeGroups?.length && this.checkLose();

    if (isLose) {
      gsap.to({}, {
        duration: 1,
        onComplete: () => {
          this.eventBus.dispatchEvent({type: "game:lose"});
        }
      });
      return;
    }

    shapeGroups.length
      ? this.setInteractiveShapes(true)
      : this.generateSquaresGroupArray();
  }

  checkOnAddPoints() {
    const fullRowsCellIds = this.checkColumnOrRow("row");
    const fullColumnsCellIds = this.checkColumnOrRow("column");

    const allUniqSquares = [...new Set([...fullColumnsCellIds, ...fullRowsCellIds])];

    if (!allUniqSquares.length)
      return Promise.resolve();

    const cells = TetrisContainer.getCollectionByType("cell");

    const necessaryCells = cells.filter(({id}) => allUniqSquares.includes(id));

    const squares = necessaryCells.map(cell => cell.getSquare());

    const shuffledSquaresViews = shuffle(squares.map(({view}) => view));

    const tween = gsap.to(shuffledSquaresViews, { //todo: в константы delay
      alpha: 0,
      delay: i => 0.3 + (i * 0.05),
      duration: 0.3,
      ease: "sine.inOut"
    });

    const onEndHideAnimation = res => {
      squares.forEach(square => square.destroy());
      this.eventBus.dispatchEvent({type: "currentPoints:add", addCount: squares?.length});
      res();
    };

    return new Promise(res => tween.eventCallback("onComplete", () => onEndHideAnimation(res)));
  }

  checkColumnOrRow(side) {
    const cells = this.cellsToGrid();

    const length = side === "row" ? cells.length : cells[0].length;

    const completed = [];

    for (let counter = 0; counter < length; counter++) {
      let isSideComplete = true;

      const subLength = side === "row" ? cells[counter].length : cells.length;

      for (let subCounter = 0; subCounter < subLength; subCounter++) {
        const [index, subIndex] = [side === "row" ? counter : subCounter, side === "row" ? subCounter : counter];

        const necessaryCell = cells[index][subIndex];

        if (necessaryCell.isDisabledCell) continue;

        if (!necessaryCell.getSquare()) {
          isSideComplete = false;
          break;
        }
      }

      if (isSideComplete)
        ({
          row: () => {
            completed.push(...(cells[counter].reduce((acc, cell) => {
              return cell.isDisabledCell ? acc : [...acc, cell.id];
            }, [])));
          },
          column: () => {
            for (let row = 0; row < cells.length; row++) {
              const necessaryCell = cells[row][counter];
              !necessaryCell.isDisabledCell && completed.push(necessaryCell.id);
            }
          }
        })[side]();
    }

    return completed;
  }

  checkLose() {
    const groups = TetrisContainer.getCollectionByType("squaresGroupView");

    const cells = TetrisContainer.getCollectionByType("cell");

    const groupShapes = groups.map(({squares}) => squares.reduce((acc, square) => [...acc, square.getPosById()], []));

    return !groupShapes.some(shape => {
      return cells.some(cell => {
        const {row: cellRow, column: cellColumn} = cell.getPosById();

        const necessaryCells = shape.reduce((acc, {row, column}) => {
          const necessaryId = `${cellRow + row}-${cellColumn + column}`;
          return [...acc, cells.find(cell => cell.id === necessaryId)];
        }, []);

        return necessaryCells.every(cell => this.isCellEmpty(cell));
      });
    });
  }

  update(deltaTime) {
  }

  reset() {
    this.cellSize = null;
  }
}
