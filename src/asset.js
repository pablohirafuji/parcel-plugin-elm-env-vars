const path = require('path');
const fse = require('fs-extra');;
const camelcase = require('camelcase');
const { Asset } = require('parcel-bundler');

module.exports = class ElmEnvVarsPlugin extends Asset {

  constructor(name, options) {
    super(name, options);
    console.log(name);
    console.log(options.env);
  }

  async generate() {
    const generated = await super.generate();
    // console.log(generated);
    return generated;
  }
}