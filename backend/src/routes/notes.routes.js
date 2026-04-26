const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  getNotes, getNoteById, createNote, updateNote, deleteNote,
} = require('../controllers/notes.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getNotes);
router.get('/:id', getNoteById);

router.post(
  '/',
  [
    body('title').optional().isLength({ max: 500 }),
    body('content').optional().isString(),
    body('tagIds').optional().isArray(),
    body('isPinned').optional().isBoolean(),
  ],
  validate,
  createNote
);

router.put(
  '/:id',
  [
    body('title').optional().isLength({ max: 500 }),
    body('content').optional().isString(),
    body('tagIds').optional().isArray(),
    body('isPinned').optional().isBoolean(),
  ],
  validate,
  updateNote
);

router.delete('/:id', deleteNote);

module.exports = router;