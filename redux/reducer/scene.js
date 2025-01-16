import Builder from "../../utils/redux/builder";
import {states} from "../../constants/states"

const builder = new Builder({
  name: "scene",
  initialState: {
    state: "loadManifest",
    loadingProgress: 0,
    previousStates: []
  },
  reducers: {
    onReady(state) {
      state.ready = true;
    },
    onLoadingProgress(state, {payload: progress}) {
      state.loadingProgress = progress;
    },
    requestPreviousState(state) {
      if (state.previousStates.length)
        state.state = state.previousStates.splice(-1, 1)[0];
    },
    requestState(state, action) {
      let nextState = action.payload;

      if (!states[state.state].availableStates || states[state.state].availableStates.indexOf(nextState) !== -1) {
        state.previousStates.push(state.state);
        state.state = nextState;
      }
    },
  }
});

builder.create();
const scene = builder.export();
export default scene;

export const {requestState, onReady, onLoadingProgress} = scene.actions;
export const {useScene} = scene.selectors;

export function getNextState(currentState) {
  let nextState = states[currentState]?.availableStates[0];
  if (!nextState) {
    const keys = Object.keys(states);
    nextState = keys[Math.min(keys.indexOf(currentState) + 1, keys.length - 1)];
  }
  return nextState;
}
