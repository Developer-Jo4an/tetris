import BaseTetrisController from "../../../controllers/tetris/controllers/BaseTetrisController";
import TetrisContainer from "../../../controllers/tetris/helpers/TetrisContainer";
import Square from "../entites/Square";

export default class TetrisSquaresController extends BaseTetrisController {
  constructor(data) {
    super(data);

    this.init();
  }

  initializationSelect() {
    const cells = TetrisContainer.getCollectionByType("cell");

    cells.forEach(cell => {
      const square = new Square({
        id: cell.id,
        stage: this.stage,
        name: `square:${cell.id}`,
        level: this.level,
        storage: this.storage,
        eventBus: this.eventBus,
        size: cell.size
      });

      !cell.isDisabledCell && cell.addSquare(square);
    });
  }
}
