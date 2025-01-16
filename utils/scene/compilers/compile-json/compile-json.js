const _ = require("lodash");
const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const through = require("through2").obj;

module.exports = (params) => {

  return () => {
    return gulp.src(["data/**/*.json", "!**/_*.json"])
      .pipe(compileJson(params))
      .pipe(gulp.dest("../../../../public"));
  };
};

function compileJson(_params) {
  const params = _.assign(
    {
      "importPrefix": "@@",
      "intend": "  "
    },
    _params
  );
  const testImportPrefix = initPrefix(params.importPrefix);

  return through((chunk, encoding, callback) => {
    const contents = chunk.contents.toString();
    const data = JSON.parse(contents);

    const newData = imports(data.root, chunk.path);

    chunk.path = path.resolve(path.dirname(chunk.path), data.compileTo);
    const newContents = JSON.stringify(newData, null, params.intend);

    chunk.contents = chunk.isBuffer() ? Buffer.from(newContents) : newContents;
    callback(null, chunk);
  });

  function initPrefix(val) {
    if (typeof val === "function") {
      return val;
    }

    let reg = val;
    if (typeof val === "string") {
      reg = new RegExp(`^${val}(.+)$`);
    }

    if (reg instanceof RegExp) {
      return (test) => {
        const exec = reg.exec(test);
        return {
          check: !!exec,
          key: exec && exec[1] || test
        }
      };
    }

    throw new Error("wrong prefix");
  }

  function imports(info, file) {
    if (info && typeof info === "object") {
      Object.keys(info).forEach(key => {
        const newKey = testImportPrefix(key);
        if (newKey && newKey.check) {
          const importFilePath = path.resolve(path.dirname(file), info[key]);
          info[newKey.key] = read(importFilePath);
          delete info[key];
          imports(info[newKey.key], importFilePath);
        } else {
          imports(info[key], file);
        }

      });
    }
    return info;
  }

  function read(filePath) {
    return JSON.parse(fs.readFileSync(filePath).toString());
  }
}
