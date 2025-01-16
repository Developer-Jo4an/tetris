module.exports = toCamelCase;

function toCamelCase(str, isClassName) {
  return str.split(/_|-/g).map(function (itm, index) {
    if (index > 0 || isClassName) itm = itm.substr(0,1).toUpperCase() + itm.substr(1);
    return itm;
  }).join("");
}
