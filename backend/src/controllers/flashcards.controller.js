const flashcardsService = require('../services/flashcards.service');

const getFlashcards = async (req, res, next) => {
  try {
    const { noteId, dueOnly, page, limit } = req.query;
    const result = await flashcardsService.getFlashcards(req.user.id, {
      noteId,
      dueOnly: dueOnly === 'true',
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 50,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const createFlashcard = async (req, res, next) => {
  try {
    const card = await flashcardsService.createFlashcard(req.user.id, req.body);
    res.status(201).json({ success: true, data: card });
  } catch (err) { next(err); }
};

const generateFlashcards = async (req, res, next) => {
  try {
    const { noteId, mode } = req.body;
    const result = await flashcardsService.generateFlashcards(req.user.id, noteId, mode || 'rule');
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const reviewFlashcard = async (req, res, next) => {
  try {
    const { rating } = req.body;
    const card = await flashcardsService.reviewFlashcard(req.user.id, req.params.id, rating);
    res.json({ success: true, data: card });
  } catch (err) { next(err); }
};

const deleteFlashcard = async (req, res, next) => {
  try {
    await flashcardsService.deleteFlashcard(req.user.id, req.params.id);
    res.json({ success: true, message: 'Flashcard deleted' });
  } catch (err) { next(err); }
};

module.exports = { getFlashcards, createFlashcard, generateFlashcards, reviewFlashcard, deleteFlashcard };