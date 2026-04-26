const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const pool = require('../db/pool');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT t.*, COUNT(nt.note_id) AS note_count
       FROM tags t
       LEFT JOIN note_tags nt ON nt.tag_id = t.id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.name ASC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
});

router.post(
  '/',
  [
    body('name').notEmpty().isLength({ max: 100 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, color } = req.body;
      const result = await pool.query(
        `INSERT INTO tags (user_id, name, color) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, name) DO UPDATE SET color = EXCLUDED.color
         RETURNING *`,
        [req.user.id, name, color || '#6366f1']
      );
      res.status(201).json({ success: true, data: result.rows[0] });
    } catch (err) { next(err); }
  }
);

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM tags WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Tag deleted' });
  } catch (err) { next(err); }
});

module.exports = router;