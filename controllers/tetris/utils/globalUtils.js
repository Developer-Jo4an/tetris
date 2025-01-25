export const globalUtils = {
  getCellSize: ({gameSize, grid, margin}) => {
    const marginFromEdge = gameSize.width * margin;
    const maxStringLength = grid.reduce((acc, {cells}) => Math.max(cells.length, acc), 0);
    const maxValue = Math.max(maxStringLength, grid.length);
    return (gameSize.width - 2 * marginFromEdge) / maxStringLength /*- maxValue*/;
  }
};
