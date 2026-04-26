const notesService = require('../services/notes.service');

const getNotes = async (req, res, next) => {
  try {
    const { search, tagId, page, limit } = req.query;
    const result = await notesService.getNotes(req.user.id, {
      search,
      tagId,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 20,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getNoteById = async (req, res, next) => {
  try {
    const note = await notesService.getNoteById(req.user.id, req.params.id);
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
};

const createNote = async (req, res, next) => {
  try {
    const note = await notesService.createNote(req.user.id, req.body);
    res.status(201).json({ success: true, data: note });
  } catch (err) { next(err); }
};

const updateNote = async (req, res, next) => {
  try {
    const note = await notesService.updateNote(req.user.id, req.params.id, req.body);
    res.json({ success: true, data: note });
  } catch (err) { next(err); }
};

const deleteNote = async (req, res, next) => {
  try {
    await notesService.deleteNote(req.user.id, req.params.id);
    res.json({ success: true, message: 'Note deleted' });
  } catch (err) { next(err); }
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };