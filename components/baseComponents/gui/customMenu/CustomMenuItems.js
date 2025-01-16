import CustomMenuItem from "./CustomMenuItem";
import React from "react";

export default function CustomMenuItems({items}) {
  return items.map(({itemsHref, itemsText, attr}, index) => {
    return (
      <CustomMenuItem key={"custom-menu-item-" + index} href={itemsHref} text={itemsText} {...attr}/>
    )
  });
}
