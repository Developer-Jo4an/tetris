import {getObjectByStringPath} from "./get-object-by-string-path";
import {isObject} from "../three-utils";

export function applyObjectProperties(_targetObj, _paramsObj, checkHierarchy = false, applyValue, skipAttrs) {
  if (!_paramsObj) _paramsObj = {};
  if (!_targetObj) _targetObj = {};

  const keys = Object.keys(_paramsObj);
  // Console.log("===>",keys, _targetObj, _paramsObj );
  let _attrPath;
  let paramsObj;
  let targetObj;
  let targetObjCurrent;
  let paramsObjCurrent;

  keys.forEach((e) => {
    if (skipAttrs && skipAttrs.indexOf(e) !== -1) return;
    _attrPath = e.split('.');
    if (_attrPath.length > 1) {
      paramsObjCurrent = _paramsObj[e];
      e = _attrPath.pop();
      paramsObj = getObjectByStringPath(_paramsObj, _attrPath);
      targetObj = getObjectByStringPath(_targetObj, _attrPath);
      // console.log('!!!!', _attrPath, e, paramsObj, targetObj, paramsObjCurrent, targetObj[e] );
    } else {
      paramsObj = _paramsObj;
      targetObj = _targetObj;
      paramsObjCurrent = paramsObj[e];
    }
    targetObjCurrent = targetObj[e];

    // console.log("->", e, targetObjCurrent, paramsObjCurrent);

    if (isObject(paramsObjCurrent)) { // The Current Params child is an Object
      // console.log('obj >',e, paramsObjCurrent);

      if (!isObject(targetObjCurrent)) { // The Current Target child is not an Object

        if (checkHierarchy) return; // Skip if the Target's Hierarchy must be used

        targetObjCurrent = targetObj[e] = {}; // Otherwise - create one for the Target
        // targetObj[e] = paramsObjCurrent;
        // return;
      }

      applyObjectProperties(targetObjCurrent, paramsObjCurrent, checkHierarchy, applyValue, skipAttrs);

    } else { // The Current Target child is a value
      if (checkHierarchy && !targetObj.hasOwnProperty(e)) return; // Skip if the Target's Hierarchy must be used
      const newVal = applyValue ? applyValue(e, targetObj[e], paramsObjCurrent, targetObj) : paramsObjCurrent;
      // console.log('val >',e, targetObj[e], paramsObjCurrent, newVal );
      if (newVal !== DONT_APPLY_PROPERIES) targetObj[e] = newVal;
      // if( applyValue ) console.log('..>', applyValue(e, targetObj[e], paramsObjCurrent, targetObj) );
    }

  });
  return targetObj;
}

export const DONT_APPLY_PROPERIES = 1010101010;
