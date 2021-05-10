const util = require('util');
const fs = require('fs');
const path = require('path');
const copyFilePromise = util.promisify(fs.copyFile);

export const copyFiles = (srcDir: string, destDir: string, files: string[]) => {
  return Promise.all(
    files.map((f) => {
      return copyFilePromise(path.join(srcDir, f), path.join(destDir, f));
    }),
  );
};

// // usage
// copyFiles('src', 'build', ['unk.txt', 'blah.txt'])
//   .then(() => {
//     console.log('done');
//   })
//   .catch((err) => {
//     console.log(err);
//   });
