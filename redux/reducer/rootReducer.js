import {combineReducers} from '@reduxjs/toolkit'
import controllerReducer from "../../components/controller/reducer/controller";
import modalReducer from "./modals";
import user from "./user";
import requests from "./requests";


const rootReducer = combineReducers({
    controllerReducer,
    modalReducer,
    [requests.name]: requests.reducer,
    [user.name]: user.reducer
});


export default rootReducer;
