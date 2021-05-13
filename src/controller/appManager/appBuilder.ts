import { copyFiles } from 'helper/file';
import path from 'path';
import fs from 'fs';
import awaitHandler from 'await-handler';
import runCommand from 'helper/command';
import { ncp } from 'ncp';

export const runner: Record<string, any> = {};

const deleteFolder = (dirPath: string) => {
  fs.rmdirSync(dirPath, { recursive: true });
};

export const startBuild = async (
  tempAppName: string,
  callback: (id: string) => void,
) => {
  const id = tempAppName;
  const dest = path.resolve(
    `${global.appRoot}/../temp/uploads/extracted/${tempAppName}/`,
  );
  callback(id);
  try {
    runner[id] = {
      status: 'RUNNING',
      activity: 'Copying files...',
    };
    const filesToCopy = [
      'webpack.prod.js',
      'webpack.common.js',
      '.babelrc',
      'tsconfig.json',
      'build.js',
    ];

    const source = path.resolve(`${__dirname}/assests/`);
    const appFolder = path.resolve(`${global.appRoot}/apps/${id}`);

    const [err, result] = await awaitHandler(
      copyFiles(source, dest, filesToCopy),
    );
    if (err) {
      runner[id] = {
        status: 'FAILED',
        activity: 'Failed to copy files',
        error: JSON.stringify(err),
      };
      deleteFolder(dest);
      return;
    }

    const extraPackages = require('./assests/package.json');

    const packageJSON = require(`${dest}/package.json`);
    packageJSON.devDependencies = {
      ...packageJSON.devDependencies,
      ...extraPackages.babel,
      ...extraPackages.webpack,
      ...extraPackages.loaders,
      ...extraPackages.utils,
    };

    packageJSON.scripts = {
      ...packageJSON.scripts,
      ...extraPackages.scripts,
    };

    // to ensure no conflicting package is installed
    delete packageJSON.dependencies['react-scripts'];

    fs.writeFileSync(
      `${dest}/package.json`,
      JSON.stringify(packageJSON),
      'utf8',
    );

    runner[id] = {
      status: 'RUNNING',
      activity: 'Package JSON updated',
    };

    // const mainFile = require();
    let mainFile = fs.readFileSync(`${dest}/src/index.js`, {
      encoding: 'utf8',
    });

    mainFile = mainFile.replace(
      /(?<=document.getElementById\(").*?(?="\);)/g,
      id,
    );

    fs.writeFileSync(`${dest}/src/index.js`, mainFile, 'utf8');

    runner[id] = {
      status: 'RUNNING',
      activity: 'index.js updated',
    };

    // const command = spawn(
    //   ,
    //   {
    //     shell: true,
    //   },
    // );

    const [error3] = await awaitHandler(
      runCommand(
        `cd ${dest} && npm i && touch src/${id}.ts && node build ${id}`,
        {
          onData: (data) => {
            runner[id] = {
              status: 'RUNNING',
              activity: 'Installing/building packages',
              data: data,
            };
          },
          onError: (error) => {
            runner[id] = {
              status: 'RUNNING',
              activity: 'Installing/building packages error',
              error,
            };
          },
          onClose: () => {
            runner[id] = {
              status: 'RUNNING',
              activity: 'Build completed succesfully',
            };
          },
        },
      ),
    );

    if (error3) {
      // error already handled through hook
      return;
    }

    ncp(`${dest}/build`, appFolder, { stopOnErr: true }, (error) => {
      if (error) {
        runner[id] = {
          status: 'FAILED',
          activity: 'Failed while copying files to app folder',
          error,
        };
        deleteFolder(dest);
      }

      runner[id] = {
        status: 'DONE',
        activity: 'Files copied to app folder.',
      };
      deleteFolder(dest);
    });
  } catch (unexpectedError) {
    runner[id] = {
      status: 'FAILED',
      activity: 'Unexpected Error',
      error: unexpectedError,
    };
    deleteFolder(dest);
  }
};
