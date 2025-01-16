import React from "react";
import Header from "../header/Header";
import CustomMenu from "../customMenu/CustomMenu";
import CustomHeaderLogo from "./CustomHeaderLogo";
import * as PropTypes from "prop-types";


export default function CustomHeader({menuList}) {
  return (
    <Header burger={true} logo={<CustomHeaderLogo/>} menu={<CustomMenu {...menuList}/>}/>
  )
}

CustomHeader.propTypes = {
  menuList: PropTypes.object
};

