import { copyFiles } from 'helper/file';
const { spawn } = require('child_process');
import cmd from 'node-cmd';
import path from 'path';
import fs from 'fs';
import awaitHandler from 'await-handler';

const runner: Record<string, any> = {};

export const startBuild = async (
  tempAppName: string,
  callback: (id: string) => void,
) => {
  const id = `${tempAppName}-${new Date().getTime()}`;
  callback(id);
  try {
    runner[id] = {
      state: 'RUNNING',
      activity: 'Copying files...',
    };
    const filesToCopy = [
      'webpack.prod.js',
      'webpack.common.js',
      '.babelrc',
      'tsconfig.json',
    ];
    const dest = path.resolve(
      `${global.appRoot}/../temp/uploads/extracted/${tempAppName}/`,
    );
    const source = `${path.resolve(__dirname)}/assests/`;

    const [err, result] = await awaitHandler(
      copyFiles(source, dest, filesToCopy),
    );
    if (err) {
      runner[id] = {
        state: 'FAILED',
        activity: 'Failed to copy files',
        error: JSON.stringify(err),
      };
      return;
    }

    const extraPackages = require('./assests/package.json');

    const packageJSON = require(`${dest}/package.json`);
    packageJSON.devDependencies = {
      ...packageJSON.devDependencies,
      ...extraPackages.babel,
      ...extraPackages.webpack,
    };

    packageJSON.scripts = {
      ...packageJSON.scripts,
      ...extraPackages.scripts,
    };

    delete packageJSON.dependencies['react-scripts'];

    fs.writeFileSync(
      `${dest}/package.json`,
      JSON.stringify(packageJSON),
      'utf8',
    );

    runner[id] = {
      state: 'RUNNING',
      activity: 'Package JSON updated',
    };

    console.log(runner[id]);

    const command = spawn(
      `cd ${dest} && npm i && touch src/${id}.ts && npm run build:os-package`,
      {
        shell: true,
      },
    );

    command.stdout.on('data', (data: string) => {
      console.log(`stdout: ${data}`);
      runner[id] = {
        state: 'RUNNING',
        activity: 'Installing/building packages',
        data: data,
      };
    });

    command.on('error', (error: any) => {
      console.log(`error: ${error.message}`);
      runner[id] = {
        state: 'RUNNING',
        activity: 'Installing/building packages error',
        error,
      };
    });

    command.on('close', (code: string) => {
      console.log(`child process exited with code ${code}`);
      runner[id] = {
        state: 'DONE',
        activity: 'Completed with code',
        error: code,
      };
    });
  } catch (unexpectedError) {
    runner[id] = {
      state: 'FAILED',
      activity: 'Unexpected Error',
      error: unexpectedError,
    };
  }
};
