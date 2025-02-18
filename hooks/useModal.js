import {useDispatch} from "react-redux";
import {useMemo} from "react";
import {closeModal, requestModal} from "../redux/reducer/modals";

export const useModal = () => {
  const dispatch = useDispatch();

  return useMemo(() => ({
    addModal: modalData => {
      dispatch(requestModal(modalData));
    },
    closeModal: modalData => {
      dispatch(closeModal(modalData));
    }
  }), []);
};