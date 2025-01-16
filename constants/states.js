export const states = {
  loadManifest: {availableStates: ["loading"], nextState: "loading"},
  loading: {availableStates: ["loadComplete"]},
  loadComplete: {availableStates: ["initialization"]},
  initialization: {availableStates: ["initializationComplete"], nextState: "initializationComplete"},
  initializationComplete: {availableStates: ["showing"], nextState: "showing"},
  showing: {availableStates: ["showingComplete"]},
  showingComplete: {availableStates: ["playing"]},
  playing: {availableStates: ["lose", "win", "paused"]},
  paused: {availableStates: ["playing"]},
  lose: {availableStates: []},
  win: {availableStates: []},
};


export const ignoreNextStates = [
  "playing"
]
