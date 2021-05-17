import fs from 'fs';
import { putFile } from './index';

export const putFilesToBucket = (id: string, source: string) => {
  const uploadedFiles = [];
  return new Promise((resolve, reject) => {
    fs.readdir(source, (err, files) => {
      if (!files) {
        reject({ error: 'No files in specified path', path: source });
        return;
      }
      Promise.all(
        files.map((fileName) => {
          const filePath = `${source}/${fileName}`;
          return putFile(`${id}/${fileName}`, filePath).then(() => {
            uploadedFiles.push(fileName);
          });
        }),
      )
        .then(() => {
          console.log(`All files for ${id} copied`);
          resolve(true);
        })
        .catch((error) => {
          // revert uploaded files uploadedFiles then
          reject(error);
        });
    });
  });
};
