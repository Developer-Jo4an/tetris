import {registerModal} from "../../../../redux/reducer/modals";

export default function initModalsList() {
  [
    //{Modal: LevelModal, name: "levelModal"}
  ].forEach(({Modal, name}) => {
    registerModal(Modal, name);
  })
}
