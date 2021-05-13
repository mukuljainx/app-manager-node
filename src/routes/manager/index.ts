import express from 'express';
import multer from 'multer';

import { buildApp, getStatus, getFile } from 'controller/appManager';

const upload = multer({ dest: 'temp/uploads/' });
const router = express.Router();

router.get('/build/status/:id', getStatus);
router.post('/build/react', upload.single('app'), buildApp);
router.get('/apps/:appName/:fileName', getFile);

export default router;
