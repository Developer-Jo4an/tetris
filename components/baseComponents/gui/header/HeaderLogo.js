import React from "react";
import {node} from "prop-types";

export default function HeaderLogo({logo}) {
  return (
    <div className={'header__logo'}>
      <a href={"#/"}>
        {logo}
      </a>
    </div>
  )
}

HeaderLogo.propTypes = {
  logo: node
};
