import React from "react";
import {popup} from "../../../../utils/window/window";
import {getShareLinks} from "../../../../utils/sharing/sharing";
import {node, string} from "prop-types";

export default function Share({children, link, type, text}) {
  const newChildren = React.Children.map(
    children,
    child => {
      if (React.isValidElement(child))
        return React.cloneElement(child, {
          onClick: (e) => onClick(e, child.props.onClick),
          href: getShareLinks(link, type, text)
        });
    });
  return (
    <>
      {newChildren}
    </>
  );
}

function onClick(e, onClick) {
  const {currentTarget: {href}} = e;
  e.preventDefault();
  popup(href);
  if (typeof onClick === "function")
    onClick(e);
}

Share.propTypes = {
  children: node,
  link: string,
  type: string,
  text: string,
};


