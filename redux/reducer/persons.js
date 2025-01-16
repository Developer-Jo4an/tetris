import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";
import initRequestReducer from "../../utils/redux/requestReducer";


export const fetchPersons = createAsyncThunk(
    "persons",
    async (isForce, {getState, requestId, signal}) => {
        const {loading, currentRequestId} = getState().persons;
        if ((loading !== "pending" || requestId !== currentRequestId) && !isForce) return;
        const response = await axios.get(`https://jsonplaceholder.typicode.com/users`);
        return response.data;
    }
);

const personsSlice = createSlice({
    name: "persons",
    reducers: {},
    initialState: {
        loading: "idle",
        currentRequestId: undefined,
        error: null,
        entities: []
    },
    extraReducers: initRequestReducer(fetchPersons, (state, action) => {
        state.entities = action.payload;
    })
});

export default personsSlice.reducer;