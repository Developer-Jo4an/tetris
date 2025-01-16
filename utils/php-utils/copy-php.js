const fs = require('fs');
const path = require('path');
const {decode} = require('html-entities');

fs.readdirSync(path.join(__dirname, '../../out/')).forEach(async (file) => {
  if (file.indexOf(".html") === -1) return;
  await addPhpUtilsLink(file);
  await renameToPhp(file);
});

fs.copyFileSync(path.join(__dirname, 'php-utils.php'), path.join(__dirname, '../../out/php-utils.php'));

function addPhpUtilsLink(file) {
  return new Promise(resolve => {
    const data = fs.readFileSync(path.join(__dirname, `../../out/${file}`));
    const str = decode(data.toString());
    const fd = fs.openSync(path.join(__dirname, `../../out/${file}`), 'w+');
    const insert = Buffer.from(`<? include_once("php-utils.php") ?>`);
    const decodedData = Buffer.from(str);
    fs.writeSync(fd, insert, 0, insert.length, 0);
    fs.writeSync(fd, decodedData, 0, decodedData.length, insert.length);
    fs.close(fd, resolve);
  });
}

function renameToPhp(file) {
  return new Promise(resolve => {
    fs.rename(
      path.join(__dirname, `../../out/${file}`),
      path.join(__dirname, `../../out/${file.replace("html", "php")}`),
      resolve);
  })
}
