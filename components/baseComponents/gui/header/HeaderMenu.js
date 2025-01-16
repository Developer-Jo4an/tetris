import React from "react";
import {node} from "prop-types";

export default function HeaderMenu({menu}) {
  return (
    <label htmlFor={"menu-burger"} className={'header__wrapper custom-header__wrapper'}>
      <div className={'header__content custom-header__content'}>
        {menu}
      </div>
    </label>
  )
}

HeaderMenu.propTypes = {
  menu: node
};
