const _ = require("lodash");
const path = require("path");
const fs = require("fs").promises;
const toCamelCase = require("../toCamelCase");
const glob = require("glob");

module.exports = async function templates({name, componentType, type = "component"}) {
  const dirName = path.resolve(__dirname, type);
  const dir = await getDirList(dirName);
  
  const ClassName = toCamelCase(name, true);
  const className = ClassName.substr(0, 1).toLowerCase() + ClassName.substr(1);
  const class_name = className.replace(/[A-Z]/g, $0 => `-${$0.toLowerCase()}`);
  
  const info = {type: componentType, ClassName, className, class_name, "class-name": class_name };
  
  return Promise.all(dir.map(async fileName => {
    try {
      const content = await fs.readFile(path.resolve(dirName, fileName));
      
      const newFileName = fileName.replace(/\{(.+?)\}/g, ($0,$1) => info[$1]);
      
      return {
        name: newFileName,
        content: _.template(content)(info)
      };
      
    } catch (err) {
      console.error(err);
    }
    return false;    
  }));
};

async function getDirList(dirName, prefix = "") {
  return new Promise((resolve, reject) => glob(
    `**/*`, 
    {cwd: dirName, nodir: true}, 
    (err, data) => err ? reject(err) : resolve(data))
  );
}