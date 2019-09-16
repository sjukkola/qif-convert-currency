const fs = require('fs');
const prompts = require('prompts');

// Read available files from current directory
const readAvailableFiles = () => {
  return fs.readdirSync('./').filter(file => /.QIF/ig.test(file));
}

// Reads a single file
const readFile = (filename) => {
  return fs.readFileSync(filename)
    .toString()
    // remove whitespace
    .replace(/^(?=\n)$|^\s*|\s*$|\n\n+/gm, '');
}

// User prompt for file selection
// Reads current current directory as a default
const selectFileToParse = async (availabeFiles = readAvailableFiles()) => {
  if (!availabeFiles || availabeFiles.length === 0)
    throw Error("No available .QIF files");

  return await prompts([{
    type: 'multiselect',
    name: 'files',
    message: 'Pick file(s) to convert',
    choices: availabeFiles.map((filename) => {
      return {
        title: filename,
        value: filename
      }
    }),
    min: 1},
    {
      type: 'number',
      name: 'rate',
      float: true,
      round: 10,
      message: 'Give exhange rate',
      validate: (value) => typeof value === 'number',
    }]);
};

const convertFile = (filename, exhangeRate) => {
  const file = readFile(filename);
  const converted = file.replace(/(T)(-?\d+.\d*)/gm, (_ , b, c) => `T${(c * exhangeRate).toFixed(2)}`);
  fs.writeFile(filename, converted, err => {
    if (err) throw err;
    console.log(`${filename} currency converted with rate of ${exhangeRate}`);
  });
}

(async () => {
  let response = await selectFileToParse();
  response.files.forEach(filename => convertFile(filename, response.rate));
})();

