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
  },
  expandRange: range => {
    const [start, end] = range;
    if (!end) return [start];
    return Array.from({length: end - start + 1}, (_, i) => start + i);
  },
  spliceOneAndReturn: arr => {
    return arr.splice(Math.floor(Math.random() * arr.length), 1)[0];
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
    return cell && !Boolean(cell.getSquare());
  }

  isValidForShapeBuilding(x, y) {
    const grid = this.storage.mainSceneSettings.levels[this.level.value].grid;
    const rows = grid.length;
    const columns = Math.max(...grid.map(({cells}) => cells.length));

    if (x < 0 || y < 0 || x >= rows || y >= columns) return false;

    const cells = TetrisContainer.getCollectionByType("cell");

    const necessaryCell = cells.find(cell => {
      const {row, column} = cell.getPosById();
      return x === row && column === y;
    });

    return necessaryCell && this.isCellEmpty(necessaryCell);
  }

  cellsToGrid() {
    const cells = TetrisContainer.getCollectionByType("cell");

    return cells.reduce((acc, cell) => {
      const [string, column] = cell.id.split("-");
      if (!acc[string]) acc[string] = [];
      acc[string][column] = cell;
      return acc;
    }, []);
  }

  generateSquaresGroupArray() {
    const cells = TetrisContainer.getCollectionByType("cell");
    const squares = TetrisContainer.getCollectionByType("square");

    const diff = cells.length - squares.length;
    const randomPercent = getRandomFromRange(0.25, 0.4);
    const squaresCount = Math.ceil(diff * randomPercent);

    const maxShapes = constants.ranges?.reduce((acc, range) =>
        squaresCount >= range[0] && acc < range[1]
          ? range[1]
          : acc
      , 0);
    const shapesRange = utils.expandRange([...new Set([1, maxShapes])]);

    const shuffledCells = shuffle(this.cellsToGrid()).map(arr => shuffle(arr));

    let totalShapes;
    let totalShapeForms;

    while (!totalShapes && shapesRange.length) {
      const randomShapesCount = utils.spliceOneAndReturn(shapesRange);

      const shapesFormCombinations = utils.generateNumberPairs(squaresCount, randomShapesCount);

      while (shapesFormCombinations.length && !totalShapes) {
        const randomShapeForm = utils.spliceOneAndReturn(shapesFormCombinations).sort((a, b) => b - a);

        const maxShape = Math.max(...randomShapeForm);

        const allShapes = [];

        const checkCompleted = () => {
          const reservedPlaces = [];
          return randomShapeForm.every(shapeLength => {
            return allShapes.some(shape => {
              const isCanShape = (
                shape.length === shapeLength &&
                shape.every(place => !reservedPlaces.includes(place))
              );
              if (isCanShape)
                reservedPlaces.push(...shape);
              return isCanShape;
            });
          });
        };

        const buildShape = (shape, visited, x, y) => {
          if (shape.length > maxShape) return;

          allShapes.push([...shape]);

          if (checkCompleted())
            return true;

          let isFindAllShapes;

          for (const [dx, dy] of constants.directions) {
            const newX = x + dx;
            const newY = y + dy;
            const id = `${newX}-${newY}`;

            if (!this.isValidForShapeBuilding(newX, newY) || visited.has(id)) continue;

            visited.add(id);
            shape.push(id);
            isFindAllShapes = buildShape(shape, visited, newX, newY);
            shape.pop();
            visited.delete(id);
            if (isFindAllShapes) break;
          }

          return isFindAllShapes;
        };

        for (const someRow of shuffledCells) {
          if (totalShapes) break;
          for (const necessaryCell of someRow) {
            if (totalShapes) break;

            if (!this.isCellEmpty(necessaryCell)) continue;
            const {row, column: col} = necessaryCell.getPosById();
            const visited = new Set();
            visited.add(necessaryCell.id);
            const isCompleted = buildShape([necessaryCell.id], visited, row, col);
            if (isCompleted) {
              totalShapeForms = randomShapeForm;
              totalShapes = allShapes;
            }
          }
        }
      }
    }

    if (!totalShapes) {
      this.generateSquaresGroupArray();
      return;
    }

    const shuffledShapes = shuffle(totalShapes);

    const usedShapes = [];

    for (const shape of shuffledShapes) {
      const shapeIndex = totalShapeForms.indexOf(shape.length);
      if (shapeIndex < 0) continue;
      const flatted = usedShapes.flat();
      const isUniqShapes = shape.every(place => !flatted.includes(place));
      if (!isUniqShapes) continue;
      totalShapeForms.splice(shapeIndex, 1);
      usedShapes.push(shape);
    }

    this.generateSquaresGroupView(usedShapes);
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
            completed.push(...(cells[counter].map(cell => cell.id)));
          },
          column: () => {
            for (let row = 0; row < cells.length; row++)
              completed.push(cells[row][counter].id);
          }
        })[side]();
    }

    return completed;
  }

  checkLose() { //todo: сделать логику проигры
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
