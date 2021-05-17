import { RequestHandler } from 'express';
import extract from 'extract-zip';
import path from 'path';
import fs from 'fs';

import { runner, startBuild } from './appBuilder';
import * as db from 'db';
import { getItem } from 'bucket';

const getCSSDimension = (x: string | number) => {
  if (isNaN(x as number)) {
    return x;
  } else {
    return parseInt(x as string, 10);
  }
};

export const getStatus: RequestHandler = (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.json(runner);
  }
  res.json(runner[id]);
};

export const buildApp: RequestHandler = (req, res) => {
  const filepath = path.join(req.file.destination, req.file.filename);

  if (req.file.mimetype !== 'application/zip') {
    res.sendStatus(400);
    return;
  }

  const tempUploadDir = path.resolve(`${global.appRoot}/../temp/uploads`);
  const appId = `${req.body.name.replace(
    ' ',
    '-',
  )}-${new Date().getTime()}`.toLowerCase();

  // in mb
  const size = req.file.size / (1024 * 1024);

  if (size > 10) {
    return res.status(400).send({
      code: 'MAX_SIZE_EXCEEDED',
      error:
        'App size too big, maximum size supported is 10 mb, please use assests from CDN if possible or mail at jainmukul1996@gmail.com',
    });
  }

  extract(filepath, {
    dir: `${tempUploadDir}/extracted/${appId}`,
  })
    .then((d) => {
      startBuild({ appId, ...req.body, user: req.user }, (id: string) => {
        res.json({ url: `/manager/build/status/${id}`, id, totalStages: 7 });
      });
      fs.unlink(`${tempUploadDir}/${req.file.filename}`, (e) => {
        console.log('error during deleting the uploaded zip', e);
      });
    })
    .catch((error) => {
      res.sendStatus(500).json(error);
    });
};

export const getFile: RequestHandler = (req, res, next) => {
  const { appName, fileName } = req.params;
  console.log(`${appName}/${fileName}`);
  getItem(`${appName}/${fileName}`, res);
};

export const getApps: RequestHandler = async (req, res, next) => {
  try {
    const apps = await db.App.find({
      $or: [{ type: 'LOCAL', userId: req.user?.id }, { type: 'GLOBAL' }],
    }).lean();

    const userIds = apps.map((x) => x.userId);
    // TODO: look for join in mongo
    const users = await db.User.find({
      _id: {
        $in: userIds,
      },
    });

    const userMap: Record<string, any> = {};
    users.forEach((u) => {
      userMap[u._id] = u;
    });

    res.json(
      apps.map((a) => ({
        ...a,
        user: userMap[a.userId],
        options: {
          ...a.options,
          width: getCSSDimension(a.options.width),
          height: getCSSDimension(a.options.height),
        },
      })),
    );
  } catch (error) {
    res.status(500).json({
      error,
      message: 'Something went wrong while fetching apps or users',
    });
  }
};
