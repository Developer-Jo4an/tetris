import React from "react";


const Game = React.forwardRef(
  function Game({}, ref) {
    return (
      <div className={"game"} ref={ref}>
      </div>
    );
  });
export default Game;
Game.propTypes = {};

