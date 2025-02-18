import {registerModal} from "../../../../redux/reducer/modals";
import {GameEndModal} from "../../../modals/gameEnd/GameEndModal";

export default function initModalsList() {
  [
    {Modal: GameEndModal, name: "gameEnd"}
    //{Modal: LevelModal, name: "levelModal"}
  ].forEach(({Modal, name}) => {
    registerModal(Modal, name);
  })
}
