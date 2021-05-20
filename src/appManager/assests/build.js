const webpack = require('webpack');
const config = require('./webpack.prod');
const chalk = require('chalk');

const appName = process.argv[2];
const host = process.argv[3] || 'https://agni-web-os.herokuapp.com';
config.output.publicPath =
  host + config.output.publicPath.replace('appName', appName);

const compiler = webpack(config);

compiler.run((err, stats) => {
  console.log(stats);
  if (err) {
    console.log(chalk.red(err));
    process.exitCode = 1;
  }

  compiler.close((closeErr) => {
    console.log(chalk.red(closeErr));
  });
});
