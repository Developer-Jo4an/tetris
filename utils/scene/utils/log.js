import {getIsDebug} from "../debug/getIsDebug";

export function getLogger(type) {

  return getIsDebug() ? console[type] : () => {
  };
}
