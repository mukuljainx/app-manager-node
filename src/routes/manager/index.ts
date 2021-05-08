import express from 'express';
import multer from 'multer';

const router = express.Router();

router.get('/zip', (req, res) => {
  res.send('200');
});

const upload = multer({ dest: 'uploads/' });
router.post('/zip', upload.single('app'), (req, res) => {
  console.log(req);
  res.send(200);
});

export default router;
