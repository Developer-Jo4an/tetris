const inquirer = require("inquirer");
const fs = require("fs").promises;
const path = require("path");

const generate = require("./generate");

async function main() {
  const info = await (doInquirer().then(generate));
  
  const saveTo = path.resolve(process.cwd(), "components");
  info.map(({name, content}) => write(path.resolve(saveTo, name), content));
}

function doInquirer() {
  return inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Название компонента',
      default: '',
    },
    {
      type: 'list',
      name: 'componentType',
      message: 'Тип компонента',
      choices: [
        {
          "name": "Класс",
          "value": "class"
        },
        {
          "name": "Функция",
          "value": "function"
        }
      ],
      default: (res) => /^[A-Z]/.test(res.name) ? 0 : 1
    }
  ]);
}

async function write(name, content) {
  await fs.mkdir(path.dirname(name), {recursive: true});
  return fs.writeFile(name, content);
}

main();
