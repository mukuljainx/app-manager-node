const util = require('util');
const fs = require('fs');
const path = require('path');
const copyFilePromise = util.promisify(fs.copyFile);
import { ncp } from 'ncp';

export const copyFiles = (srcDir: string, destDir: string, files: string[]) => {
  return Promise.all(
    files.map((f) => {
      return copyFilePromise(path.join(srcDir, f), path.join(destDir, f));
    }),
  );
};

export const recursiveCopy = (source: string, dest: string) => {
  return new Promise((res, rej) => {
    ncp(source, dest, { stopOnErr: true }, (error) => {
      if (error) {
        rej(error);
      } else {
        res(true);
      }
    });
  });
};
