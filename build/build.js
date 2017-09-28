if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = JSON.parse('"production"')
}
const fs = require('fs-extra')
const chalk = require('chalk')
const env = require('./config/env')
const inquirer = require('inquirer')
const webpackTask = require('./build-common')
const webpackConfig = require('./webpack.prod')
const compile = (buildEnv) => {
  webpackConfig.output.publicPath = env[buildEnv].publicPath

  return Promise.resolve()
    .then(() => webpackTask(webpackConfig, buildEnv))
    .catch((err) => {
      console.log(chalk.red('Compiler encountered an error.'), err)
      process.exit(1)
    })
}
fs.removeSync('./dist')
fs.remove('./zip', () => {
  inquirer.prompt({
    type: 'rawlist',
    name: 'env',
    message: '\n\n选择编译到哪个环境?',
    choices: ['test', 'beta', 'prod'],
    default: ['test']
  }).then((res) => {
    compile(res.env)
  })
})

