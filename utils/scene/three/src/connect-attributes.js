export function connectAttrs(toObj, fromObj, attrList, addIfDosntExist = true) {
  if (!attrList) return;
  attrList.forEach((e) => {
    // Console.log('>',e,toObj.hasOwnProperty(e));
    if (!addIfDosntExist && !toObj.hasOwnProperty(e)) return;
    toObj[e] = fromObj[e];
  });
}
