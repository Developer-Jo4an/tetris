import React from "react";
import {node, array, string, object} from "prop-types";

export default function Select({
                                 label,
                                 children,
                                 register,
                                 options,
                                 error,
                                 name,
                                 errorData,
                                 ...rest
                               }) {
  return (
    <label>
      {label ?? <span>{label}</span>}
      <select name={name} ref={register} {...rest}>
        {options.map((val) => {
          const {label, value} = init(val);
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      {error}
      {children}
    </label>
  );
}

function init(value) {
  if (["string", "number", "boolean"].indexOf(typeof value) >= 0) {
    return {label: value, value};
  }
  return value;
}

Select.propTypes = {
  label: string,
  children: node,
  options: array,
  error: node,
  name: string,
};
