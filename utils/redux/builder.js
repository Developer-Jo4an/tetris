import {createCustomReducer} from "./requestReducer";
import {createSlice} from "@reduxjs/toolkit";
import {useSelector} from "react-redux";
import {camelCase} from "lodash"

export default class Builder {

  name = "someSlice";

  initialState = {};

  extraReducers = {};

  thunks = {};

  reducers = {};

  selectors = {};

  builderActions = [];

  constructor({name, initialState, reducers} = {}) {
    this.name = name ?? this.name;
    this.initialState = initialState ?? this.initialState;
    this.reducers = reducers ?? this.reducers;

    this.createSelector(this.name, state => state[this.name]);
  }

  createExtraReducer({
                       thunkName, thunkExtraName,
                       func,
                       onSubmit, saveData, saveError,
                       controller,
                       ...etc
                     }) {
    const {name: sliceName} = this;

    const {reducer, thunk} = createCustomReducer({
      sliceName,
      thunkName: `${sliceName}/${thunkName}`,
      controller,
      onSubmit,
      saveError,
      saveData,
      func,
      ...etc
    });
    this.extraReducers = {...this.extraReducers, ...reducer};
    this.thunks[thunkExtraName ?? thunkName] = thunk;

    return this;
  }

  addExtraReducer(reducer) {
    this.extraReducers = {...this.extraReducers, ...reducer};
    return this;
  }

  addReducerBuilderAction(funcName, args = []) {
    this.builderActions.push({funcName, args});
    return this;
  }

  addMatcher(condition, reducer) {
    this.addReducerBuilderAction("addMatcher", [condition, reducer]);
    return this;
  }

  addDefaultCase(reducer) {
    this.addReducerBuilderAction("addDefaultCase", [reducer]);
    return this;
  }

  createSelector(name, selector) {
    this.selectors[camelCase(`use-${name}`)] = function useSomeSelector() {
      return useSelector((state) => selector.call(null, state, ...arguments))
    };
    return this;
  }

  create() {
    const {extraReducers, reducers, name, initialState, builderActions} = this;

    const slice = createSlice({
      name,
      initialState,
      reducers,
      extraReducers: builder => {
        Object
          .entries(extraReducers)
          .forEach(([actionName, reducer]) => builder.addCase(actionName, reducer));

        builderActions.forEach(({funcName, args}) => builder[funcName]?.apply(builder, args))
      }
    });

    this.slice = slice;

    return this;
  }

  export() {
    const {name, selectors, slice: {reducer, actions}, thunks} = this;
    return {
      name,
      selectors,
      reducer,
      actions,
      thunks,
      ...selectors
    }
  }
}


