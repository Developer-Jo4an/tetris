import React from "react";
import * as PropTypes from "prop-types";


export default function CustomMenuItem(props) {
  return (
    <li className={"custom-menu__item " + props.className} {...props.attr}>
      <a className={"custom-menu__item-link"} href={props.href}>
        {props.text}
      </a>
    </li>
  )
}

CustomMenuItem.propTypes = {
  className: PropTypes.string,
  attr: PropTypes.object,
  href: PropTypes.string,
  text: PropTypes.string,
};
