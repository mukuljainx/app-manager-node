import express from 'express';
import multer from 'multer';
import extract from 'extract-zip';
import path from 'path';

const router = express.Router();

router.get('/zip', (req, res) => {
  res.send('200');
});

const upload = multer({ dest: 'temp/uploads/' });
router.post('/zip', upload.single('app'), (req, res) => {
  var filepath = path.join(req.file.destination, req.file.filename);
  if (req.file.mimetype !== 'application/zip') {
    res.sendStatus(400);
    return;
  }

  extract(filepath, {
    dir: path.resolve(global.appRoot + '/../temp/uploads/extracted'),
  })
    .then(d => {
      console.log(d);
      res.send(200);
    })
    .catch(console.log);
});

export default router;
