const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const camelcase = require('camelcase');
const cosmiconfig = require('cosmiconfig');

module.exports = async function init(bundler) {
  const NODE_ENV = process.env.NODE_ENV;
  const dotenvPath = path.join(process.cwd(), '.env');

  const dotenvFiles = [
    `${dotenvPath}.${NODE_ENV}.local`,
    `${dotenvPath}.${NODE_ENV}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== 'test' && `${dotenvPath}.local`,
    dotenvPath
  ].filter(Boolean);

  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      require('dotenv').config({
        path: dotenvFile
      });
    }
  });

  const explorer = cosmiconfig('parcel-plugin-elm-env-vars');

  let config = {
    moduleName: 'EnvVars',
    vars: [
      "^NODE_ENV$",
      "^ELM_"
    ]
  };

  const customConfig = await explorer.search();
  if (customConfig && customConfig.config) {
    config = Object.assign(config, customConfig.config);
  }
  console.log(config);
  const varsRegex = new RegExp(config.vars.join('|'), 'i');

  const foundVars =
    Object.keys(process.env)
    .filter(key => varsRegex.test(key))
    .reduce(
      (env, key) => {
        env[key] = process.env[key];
        return env;
      }, {}
    );
  console.log(foundVars);

  const splittedModuleName =
    config.moduleName.split('.')
    .filter((s) => s)
    .map((p) => camelcase(p, { pascalCase: true }));
  const middlePaths = splittedModuleName.slice(0, -1);
  const fileName = splittedModuleName.slice(-1)[0];
  const outputDir = path.join.apply(null, [process.cwd(), 'autogenerated'].concat(middlePaths));
  await fse.outputFile(path.join(outputDir, `${fileName}.elm`), generateElmFileContent(splittedModuleName.join('.'), foundVars));
};

function generateElmFileContent(moduleName, foundVars) {
  const envVars =
    Object.entries(foundVars)
    .map(([originalName, value]) => {
      const funcName = camelcase(originalName);
      return `\n${funcName} : String\n${funcName} =\n    ${JSON.stringify(value)}\n`;
    }).join('\n');

  const content = `module ${moduleName} exposing (..)

-- This file was autogenerated by parcel-plugin-elm-env-vars.
-- Do not edit it manually.

${envVars}`
  return content;
}