import BaseTetrisController from "../../../controllers/tetris/controllers/BaseTetrisController";
import TetrisFactory from "../../../controllers/tetris/helpers/TetrisFactory";
import Square from "../entites/Square";

export default class TetrisSquaresController extends BaseTetrisController {
  constructor(data) {
    super(data);
  }

  initializationSelect() {
    const cells = TetrisFactory.getCollectionByType("cell");

    cells.forEach(cell => {
      const square = new Square({
        id: cell.id,
        name: `square:${cell.id}`,
        storage: this.storage,
        eventBus: this.eventBus,
        size: cell.size
      });

      cell.view.addChild(square.view);
    });
  }
}
