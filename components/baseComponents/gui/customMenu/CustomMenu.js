import React from "react";
import * as PropTypes from "prop-types";
import CustomMenuItems from "./CustomMenuItems";


export default function CustomMenu({customMenuItems}) {
  return (
    <nav className={"custom-menu"}>
      <ul>
        <CustomMenuItems items={customMenuItems}/>
      </ul>
    </nav>
  )
}


CustomMenu.propTypes = {
  customMenuItems: PropTypes.array
};
