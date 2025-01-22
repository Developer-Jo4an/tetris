import BaseTetrisController from "./BaseTetrisController";
import TetrisContainer from "../helpers/TetrisContainer";
import {getRandomFromRange, getRandomIntFromRange} from "../../../utils/data/random/getRandomFromRange";
import SquaresGroupView from "../entites/SquaresGroupView";

const utils = {};

const constants = {
  directions: [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]],
  ranges: [[4, 2], [8, 3], [12, 4]]
};

export default class TetrisSpawnAreaController extends BaseTetrisController {
  step = 0;

  constructor(data) {
    super(data);
  }

  init() {

  }

  playingSelect() {
    this.generateSquaresGroupArray();
  }

  generateSquaresGroupArray() {
    const {grid} = this.storage.mainSceneSettings.levels[this.level];

    const {strings, columns} = grid.reduce((acc, {cells}) => {
      return {...acc, columns: Math.max(cells.length, acc.columns)};
    }, {columns: 0, strings: grid.length});

    const cells = TetrisContainer.getCollectionByType("cell");
    const squares = TetrisContainer.getCollectionByType("square");

    const diff = cells.length - squares.length;

    const randomPercent = getRandomFromRange(0.25, 0.4);

    const squaresCount = Math.ceil(diff * randomPercent);

    const shapesCount = (() => {
      const copiedRanges = JSON.parse(JSON.stringify(constants.ranges)).reverse();

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
        const [string, column] = cell.id.split("-");
        if (!acc[string]) acc[string] = [];
        acc[string][column] = cell;
        return acc;
      }, []);

      const allShapes = [];

      const isCellEmpty = cell => !Boolean(cell.view.getChildByName(`square:${cell.id}-sprite`));

      const isValid = (x, y) => (
        x >= 0 && y >= 0 &&
        x < strings && y < columns &&
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

      for (let row = 0; row < strings; row++) {
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
    this.step++;

    const shapeEls = shapes.map((shape, index) => {
      const id = `${this.step}:${index}`;
      return new SquaresGroupView({
        id,
        shape,
        level: this.level,
        storage: this.storage,
        eventBus: this.eventBus,
        name: `squaresGroupView:${id}`,
      });
    });
  }

  update(deltaTime) {

  }
}
