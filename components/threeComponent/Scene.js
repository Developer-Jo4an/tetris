import {useEffect, useRef, useState} from "react";
import {useLoadController} from "../../utils/scene/react/hooks/useLoadController";
import {basePixiImports} from "../../utils/scene/utils/import/import-pixi";
import useStateReducer from "../../utils/scene/react/hooks/useStateReducer";

const stateMachine = {
  loadManifest: {availableStates: ["loading"], nextState: "loading", isDefault: true},
  loading: {availableStates: ["initialization"], nextState: "initialization"},
  initialization: {availableStates: ["showing"], nextState: "showing"},
  showing: {availableStates: [], nestState: "showing"}
};

const ignoreNextState = ["showing"];

export default function Scene() {
  const [wrapper, setWrapper] = useState();
  const [state, setState] = useState(Object.entries(stateMachine).find(([_, value]) => value.isDefault)[0]);
  const containerRef = useRef();

  const setStateCallback = newState => {
    if (!stateMachine[state].availableStates.includes(newState))
      throw new Error(`Not available state ${newState}`);

    setState(newState);
  };

  const nextStateCallback = () => {
    const nextState = stateMachine[state].nextState;

    if (!nextState || !stateMachine[state].availableStates.includes(nextState))
      throw new Error(`No next state or not available, nextState: ${nextState}`);

    setState(nextState);
  };

  useStateReducer({}, ignoreNextState, nextStateCallback, state, wrapper);

  useLoadController({
    getLibsPromise: basePixiImports,
    getWrapperPromise: () => import("../../controllers/tetris/TetrisWrapper"),
    beforeInit: ({wrapper}) => setWrapper(wrapper),
    afterInit: ({wrapper}) => {
      wrapper.setLevel("1");
      wrapper.appendContainer(containerRef.current);
    }
  });

  useEffect(() => {
    if (!wrapper) return;

    const stateCallbacks = {
      "state:next": nextStateCallback,
      "state:change": setStateCallback
    };

    const listenerLogic = method => {
      for (const key in stateCallbacks)
        wrapper.eventBus[`${method}EventListener`](key, stateCallbacks[key]);
    };

    listenerLogic("add");

    return () => listenerLogic("remove");
  }, [wrapper, state]);

  return (
    <div className={"tetris"}>
      <div className={"tetris__container"} ref={containerRef}/>
    </div>
  );
}
