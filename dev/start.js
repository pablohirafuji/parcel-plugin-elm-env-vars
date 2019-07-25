const path = require('path');
const Bundler = require('parcel-bundler');
const ElmEnvVarsPlugin = require('../src/index');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

async function main() {
  const bundler = new Bundler(path.join(__dirname, 'test-data', 'index.html'), {
    watch: true,
    cache: false,
    hmr: true,
    logLevel: 4,
    outDir: path.join(__dirname, 'dist'),
  });
  ElmEnvVarsPlugin(bundler);
  await bundler.serve(1234, false);

}

main().catch(console.error);