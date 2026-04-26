const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const {
  getFlashcards, createFlashcard, generateFlashcards, reviewFlashcard, deleteFlashcard,
} = require('../controllers/flashcards.controller');

const router = express.Router();

router.use(authenticate);

router.get('/', getFlashcards);

router.post(
  '/',
  [
    body('question').notEmpty().withMessage('Question required'),
    body('answer').notEmpty().withMessage('Answer required'),
    body('noteId').optional().isUUID(),
  ],
  validate,
  createFlashcard
);

router.post(
  '/generate',
  [
    body('noteId').isUUID().withMessage('Valid note ID required'),
    body('mode').optional().isIn(['rule', 'ai']),
  ],
  validate,
  generateFlashcards
);

router.post(
  '/:id/review',
  [
    body('rating').isIn(['easy', 'hard', 'again']).withMessage('Rating must be: easy, hard, or again'),
  ],
  validate,
  reviewFlashcard
);

router.delete('/:id', deleteFlashcard);

module.exports = router;