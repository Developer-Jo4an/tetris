import React from "react";
import PropTypes from "prop-types";

export default function PreloaderItems({total}) {
  const items = [];
  for(let i = 0; i < total; i++){
    items.push(<div key={`preloader-item-${i}`} className={`preloader__item preloader__item_${i}`}/>)
  }

  return (<>
    {items}
  </>);
}

PreloaderItems.propType = {
  imgAttr: PropTypes.number
};
