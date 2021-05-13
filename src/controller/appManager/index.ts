import { RequestHandler } from 'express';
import extract from 'extract-zip';
import path from 'path';
import fs from 'fs';

import { runner, startBuild } from './appBuilder';

export const getStatus: RequestHandler = (req, res) => {
  const id = req.params.id;
  res.json(runner[id]);
};

export const buildApp: RequestHandler = (req, res) => {
  const filepath = path.join(req.file.destination, req.file.filename);

  if (req.file.mimetype !== 'application/zip') {
    res.sendStatus(400);
    return;
  }

  const tempUploadDir = path.resolve(`${global.appRoot}/../temp/uploads`);
  const name = `${req.file.originalname.replace(
    '.zip',
    '',
  )}-${new Date().getTime()}`;

  extract(filepath, {
    dir: `${tempUploadDir}/extracted/${name}`,
  })
    .then((d) => {
      startBuild(name, (id: string) => {
        res.json({ url: `/manager/build/status/${id}`, id });
      });
      fs.unlink(`${tempUploadDir}/${req.file.filename}`, () => {
        console.log('error during deleting the uploaded zip');
      });
    })
    .catch((error) => {
      res.sendStatus(500).json(error);
    });
};

export const getFile: RequestHandler = async (req, res) => {
  const { appName, fileName } = req.params;
  const file = path.resolve(`${global.appRoot}/apps/${appName}/${fileName}`);
  res.sendFile(file);
};
