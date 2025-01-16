import React from "react";
import {createSlice} from "@reduxjs/toolkit";
import getId from "../../utils/getId";
import {getData} from "../../utils/data/dataSaver";

const requestModalReducer = (state, data) => {

  const type = typeof data.payload === "string" ? data.payload : data.payload.type;

  const template = modalTemplates[type];

  let props = {};
  if (typeof data.payload.props === "object")
    props = data.payload.props;
  else if (typeof data.payload.props === "number")
    props = getData(data.payload.props, true);

  if (data.payload.noDoubles && modalStorage.filter(modal => modal.type === type)[0]) {
    return
  }

  const id = getId();
  const modal = React.createElement(
    template,
    {...props, id}
  );

  modalStorage.push({id, modal, type});
  state.modals.push(id);
  data.id = id;
  data.modal = modal;
};

const closeModalReducer = (state, {payload}) => {
  const {all, type, id} = payload;
  // если передан type то убираем все модальники этого типа, если id то конкретный модальник, если all то все

  let i = 0;
  let removed = false;
  while (i < modalStorage.length) {
    if (all || (type && modalStorage[i].type === type) || (id !== undefined && modalStorage[i].id === id)) {
      modalStorage.splice(i, 1);
      state.modals.splice(i, 1);
      removed = true;
    } else {
      i++
    }
  }

  if (!removed) {
    console.warn("ModalController: modal to close was not found");
  }

};

const modalController = createSlice({
  name: "modalController",
  initialState: {
    modals: []
  },
  reducers: {
    requestModal: requestModalReducer,
    closeModal: closeModalReducer
  }
});

// actions
export const {requestModal, closeModal} = modalController.actions;

const modalReducer = modalController.reducer;
export default modalReducer;

const modalTemplates = [];

export const modalStorage = [];

export function registerModal(modal, type) {
  modalTemplates[type] && console.warn("ModalController: modal with this type already exists. Overwriting");
  modalTemplates[type] = modal;
}
