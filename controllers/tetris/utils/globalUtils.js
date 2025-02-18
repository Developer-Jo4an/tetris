export const globalUtils = {
  getCellSize: ({gameSize, grid, margin}) => {
    const marginFromEdge = gameSize.width * margin;
    const maxRowLength = grid.reduce((acc, {cells}) => Math.max(cells.length, acc), 0);
    const maxValue = Math.max(maxRowLength, grid.length);
    return (gameSize.width - 2 * marginFromEdge) / maxRowLength - maxValue;
  }
};
