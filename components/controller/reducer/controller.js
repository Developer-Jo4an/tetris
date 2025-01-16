import {createSlice} from "@reduxjs/toolkit";
import getId from "../../../utils/getId";

const requestPluginReducer = (state, action) => {
    const payload = Object.assign({}, action.payload);
    let propKeys;
    if (payload.props) propKeys = Object.keys(payload.props);

    // проверка на то что плагин уже подключен с теми же пропами к тому же элементу
    for (let i = 0; i < state.plugins.length; i++){
        const item = state.plugins[i];
        let isSame = true;
        if (item.plugin !== payload.plugin) {
            isSame = false;
        }

        // сверяем пропы
        if (payload.props && propKeys.length === Object.keys(item).length && isSame){
            propKeys.forEach(propKey=>{
                if (payload.props[propKey] !== item.props[propKey]){
                    isSame = false;
                }
            })
        }

        if (isSame) {
            if (item.subscribers.indexOf(payload.uuid) === -1)
                item.subscribers.push(payload.uuid);
            return;
        }
    }

    payload.subscribers = [payload.uuid];
    payload.data = {};
    if (!payload.props){
        payload.props = {};
    }

    if (!payload.props.target){
        payload.props.target = payload.uuid;
    }

    payload.uuid = getId();

    state.plugins.push(payload);

};

const setDataReducer = (state, {payload}) => {
    const plugin = getControllerValueHelper(state.plugins, payload.target, payload.plugin, true);
    if (!plugin){
        console.warn("Controller: plugin was not found");
        return;
    }
    plugin.data = Object.assign(plugin.data, payload);
};

const unsubscribeReducer = (state, {payload}) => {
    const plugin = getControllerValueHelper(state.plugins, payload.uuid, payload.plugin, true);
    if (!plugin){
        return;
    }
    plugin.subscribers.splice(plugin.subscribers.indexOf(payload.uuid), 1);
    if (plugin.subscribers.length === 0){
        state.plugins.splice(state.plugins.indexOf(plugin), 1);
    }
};

const controllerPlugins = createSlice({
    name: "controllerPlugins",
    initialState: {
        plugins: []
    },
    reducers: {
        requestPlugin:requestPluginReducer,
        setData: setDataReducer,
        unsubscribe: unsubscribeReducer
    }
});

export function getControllerValueHelper(plugins, target, type, getPlugin){
    const result = plugins.filter(plugin=>plugin.plugin === type && plugin.subscribers.indexOf(target) !== -1)[0];
    if (getPlugin){
        return result;
    }else{
        return result ? result.data : {};
    }
}
// actions
export const {requestPlugin, setData, unsubscribe} = controllerPlugins.actions;
// reducer
const controllerReducer = controllerPlugins.reducer;
export default controllerReducer;
// ref storage
const refStorage = {};

export function saveRef(ref, uuid){
    refStorage[uuid] = ref;
}

export function getRef(uuid){
    return refStorage[uuid];
}

