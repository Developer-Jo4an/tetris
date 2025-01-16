import {useEffect} from "react";

export default function useStateReducer(reducers = {}, ignoreNextStates = [], nextState, state, wrapper) {
  useEffect(() => {
    if (!wrapper) return;
    const eventData = {state, promise: null};
    wrapper.eventBus.dispatchEvent({type: "apply-state", data: eventData});
    const {promise: controllerPromise} = eventData;
    let ignorePromise = ignoreNextStates.indexOf(state) !== -1;

    console.log(state, controllerPromise);


    if (typeof reducers[state] === "function")
      reducers[state](controllerPromise);

    if (!ignorePromise)
      controllerPromise.then(() => nextState(state));
  }, [state, wrapper]);
}
