export function getNextState(states, currentState) {
  let nextState = states[currentState]?.nextState ?? states[currentState]?.availableStates[0];
  if (!nextState) {
    const keys = Object.keys(states);
    nextState = keys[Math.min(keys.indexOf(currentState) + 1, keys.length - 1)];
  }
  return nextState;
}

export function reducer(state, action) {
  switch (action.type) {
    case "set-wrapper":
      return {...state, wrapper: action.payload}
    case "next-state":
      return {...state, state: getNextState(state.states, state.state)}
    case "change-state":
      return {...state, state: action.payload}
  }
}
