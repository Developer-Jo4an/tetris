import {findGetParameter} from "../utils/findGetParameter";

export function getIsDebug() {
  return  process.env.NODE_ENV === "development" || global.DEBUG || findGetParameter("debug")
}
