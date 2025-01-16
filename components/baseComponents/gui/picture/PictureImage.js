import React from "react";
import PropTypes from "prop-types";

export default function PictureImage({imgAttr} = {}) {
  return <img {...{alt: "img", ...imgAttr}}/>;
}

PictureImage.propType = {
  imgAttr: PropTypes.any
};
