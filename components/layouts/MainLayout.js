import React, {useEffect} from "react";
import {node} from "prop-types";
import {modalStorage} from "../../redux/reducer/modals";
import ModalController from "../baseComponents/controllers/modalController/modalController";
import initModalsList from "../baseComponents/containers/modalsList/modalsList";

export default function MainLayout({children}) {
  useEffect(() => {
    initModalsList();
  }, []);

  return (
    <>
      <input type={"checkbox"} className={"custom-header__input"} id={"menu-burger"}/>
      <div className={"main-container"}>
        <div className={"content-wrapper"}>{children}</div>
      </div>
      <ModalController modalStorage={modalStorage}/>
    </>
  );
}

MainLayout.propTypes = {
  children: node,
};
