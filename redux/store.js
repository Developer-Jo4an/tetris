import {configureStore} from "@reduxjs/toolkit";
import rootReducer from "./reducer/rootReducer";
import scene from "./reducer/scene";

const preloadedState = {};

const store = configureStore({
  reducer: rootReducer,
  preloadedState,
  [scene.name]: scene.reducer
});

export default store;
