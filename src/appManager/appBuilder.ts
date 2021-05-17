import { copyFiles, recursiveCopy } from 'helper/file';
import path from 'path';
import fs from 'fs';
import awaitHandler from 'await-handler';
import runCommand from 'helper/command';
import * as db from 'db';
import { putFilesToBucket } from 'bucket/helper';

export const runner: Record<string, any> = {};

const updateStatus = (id: string, body: any) => {
  if (runner[id]) {
    runner[id] = { ...runner[id], ...body };
  }
};

const deleteFolder = (dirPath: string) => {
  fs.rmdirSync(dirPath, { recursive: true });
};

interface IProps {
  appId: string;
  height: string;
  icon: string;
  name: string;
  width: string;
  user: Express.User;
}

export const startBuild = async (
  { appId, icon, height, name, width, user }: IProps,
  callback: (id: string) => void,
) => {
  const id = appId;
  const extracted = path.resolve(
    `${global.appRoot}/../temp/uploads/extracted/${appId}/`,
  );
  const buildPath = path.resolve(`${extracted}/build`);
  callback(id);
  try {
    runner[id] = {
      status: 'RUNNING',
      activity: 'Preparing for build...',
      stage: 1,
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
      copyFiles(source, extracted, filesToCopy),
    );
    if (err) {
      updateStatus(id, {
        status: 'FAILED',
        activity: 'Failed while trying to copy required files.',
        error: err,
      });
      deleteFolder(extracted);
      return;
    }

    const extraPackages = require('./assests/package.json');

    const packageJSON = require(`${extracted}/package.json`);
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
      `${extracted}/package.json`,
      JSON.stringify(packageJSON),
      'utf8',
    );

    updateStatus(id, { activity: 'Updaing required files...', stage: 2 });

    // const mainFile = require();
    let mainFile = fs.readFileSync(`${extracted}/src/index.js`, {
      encoding: 'utf8',
    });

    mainFile = mainFile.replace(
      /(?<=document.getElementById\(").*?(?="\);)/g,
      id,
    );

    fs.writeFileSync(`${extracted}/src/index.js`, mainFile, 'utf8');

    updateStatus(id, {
      stage: 3,
      activity: 'Installing required dependencies...',
    });

    const [error3] = await awaitHandler(
      runCommand(
        `cd ${extracted} && npm i && touch src/${id}.ts && node build ${id}`,
        {
          onData: (data) => {
            updateStatus(id, { stage: 4, data, activity: 'Building app...' });
          },
          onError: (error) => {
            updateStatus(id, {
              status: 'FAILED',
              activity: 'Unable to install required dependencies.',
              error,
            });
          },
          onClose: () => {
            updateStatus(id, {
              stage: 4,
              activity: 'Build completed succesfully...',
            });
          },
        },
      ),
    );

    if (error3) {
      // error already handled through hook
      return;
    }

    updateStatus(id, {
      stage: 5,
      activity: 'Pushing build files to Bucket...',
    });

    // send to buckets
    console.log(buildPath);
    const [bucketError] = await awaitHandler(putFilesToBucket(id, buildPath));

    if (bucketError) {
      runner[id] = {
        status: 'FAILED',
        activity: 'Failed while uploading files to Bucket.',
        error: bucketError,
      };
      deleteFolder(extracted);
      return;
    }

    updateStatus(id, {
      stage: 6,
      activity: 'Updaing database with file entries...',
    });

    // send to db
    const newApp = new db.App({
      appId,
      icon,
      name,
      options: { height, width },
      userId: user?.id,
      type: user?.type === 'ADMIN' ? 'GLOBAL' : 'LOCAL',
    });

    const [dbError, appDetails] = await awaitHandler(db.App.create(newApp));

    if (dbError) {
      updateStatus(id, {
        status: 'FAILED',
        activity: 'Failed while updating the db.',
        error: dbError,
      });
      deleteFolder(extracted);

      return;
    }

    updateStatus(id, {
      stage: 7,
      activity: 'App published successfully.',
    });
    deleteFolder(extracted);
  } catch (unexpectedError) {
    runner[id] = {
      status: 'FAILED',
      activity: 'Unexpected Error',
      error: unexpectedError,
    };
    deleteFolder(extracted);
  }
};
