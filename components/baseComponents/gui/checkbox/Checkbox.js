import React, {useEffect} from "react";
import * as PropTypes from "prop-types";
import classNames from "classnames";
import {safeHTML} from "../../../../utils/safeHTML";


export default function Checkbox({text, compclass, mod, error, register, type="checkbox", ...rest}){
  return (
    <label className={classNames("checkbox", compclass, {[`checkbox_${mod}`]: mod})}>
      <input className={"checkbox__input"} type={type} {...rest} ref={register}/>
      <div className={"checkbox__box"}/>
      <div className={"checkbox__text"}>{safeHTML(text)}</div>
      <span className="checkbox__error">{error}</span>
    </label>
  );
}

Checkbox.propTypes = {
  text: PropTypes.string,
  compclass: PropTypes.string,
  mod: PropTypes.string,
  type: PropTypes.string,
  error: PropTypes.any,
  register: PropTypes.any,
};
