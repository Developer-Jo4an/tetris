import {createAsyncThunk} from "@reduxjs/toolkit";

export const PENDING = "pending";
export const IDLE = "idle";

export function createCustomReducer({
                                      sliceName,
                                      thunkName,
                                      func,
                                      saveData,
                                      saveError,
                                      onSubmit,
                                      controller,
                                      ...etc
                                    }) {
  const thunk = customCreateAsyncThunk(sliceName, thunkName, func, controller, etc);

  return {reducer: initRequestReducer(thunk, {saveData, saveError, onSubmit, ...etc}, controller, thunkName), thunk}
}

export function customCreateAsyncThunk(sliceName, thunkName, request, controller, customData) {
  return createAsyncThunk(
    thunkName,
    async (data, {getState, rejectWithValue, requestId}) => {
      const state = getState();
      const stateData = state[sliceName];

      if (controller?.middleware({
        state,
        requestId,
        thunkName,
        sliceName,
        data,
        customData
      })) return;

      try {
        return await request(data, stateData, getState);
      } catch (err) {
        return rejectWithValue(err?.toSerializable?.() || err)
      }
    }
  );
}

function initRequestReducer(thunk, {saveData, saveError, onSubmit, ...etc}, controller, thunkName) {
  return {
    [thunk.pending]: (state, action) => {
      if (controller?.pending({thunkName, state, action, ...etc})) return;
      applyCallback(onSubmit, state, action, thunk);
    },
    [thunk.fulfilled]: (state, action) => {
      if (controller?.fulfilled({thunkName, state, action, ...etc})) return;
      applyCallback(saveData, state, action, thunk);
    },
    [thunk.rejected]: (state, action) => {
      if (controller?.rejected({thunkName, state, action, ...etc})) return;
      applyCallback(saveError, state, action, thunk);
    }
  }
}

function applyCallback(callBack, state, action, thunk) {
  if (typeof callBack === "function") {
    callBack(state, action, thunk);
  }
}

function checkRequest(state, requestId) {
  return state.loading === PENDING && state.currentRequestId === requestId;
}

export default initRequestReducer;
