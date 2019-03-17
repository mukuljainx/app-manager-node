import express from 'express';

const router = express.Router();

// For testing purpose
router.get('/alive', (req, res) => {
  res.sendStatus(200);
});

export default router;
