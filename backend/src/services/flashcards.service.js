const pool = require('../db/pool');

// ── HTML Stripper ─────────────────────────────────────────────────────────────
const stripHtml = (html = '') => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

// ── Spaced Repetition Algorithm ───────────────────────────────────────────────
const INTERVALS = [1, 3, 7, 14, 30, 60, 120];

const calculateNextReview = (card, rating) => {
  let { ease_factor, interval_days, repetition_count } = card;
  ease_factor = parseFloat(ease_factor);

  const now = new Date();
  let newInterval;

  switch (rating) {
    case 'easy':
      repetition_count += 1;
      ease_factor = Math.min(2.5, ease_factor + 0.15);
      newInterval = repetition_count <= INTERVALS.length
        ? INTERVALS[Math.min(repetition_count, INTERVALS.length - 1)]
        : Math.round(interval_days * ease_factor);
      break;
    case 'hard':
      repetition_count = Math.max(0, repetition_count - 1);
      ease_factor = Math.max(1.3, ease_factor - 0.15);
      newInterval = Math.max(1, Math.round(interval_days * 0.6));
      break;
    case 'again':
      repetition_count = 0;
      ease_factor = Math.max(1.3, ease_factor - 0.2);
      newInterval = 1;
      break;
    default:
      newInterval = 1;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    ease_factor: parseFloat(ease_factor.toFixed(2)),
    interval_days: newInterval,
    repetition_count,
    last_review_date: now,
    next_review_date: nextReview,
  };
};

// ── Rule-based flashcard generation ──────────────────────────────────────────
const generateFromText = (rawText) => {
  const text = stripHtml(rawText);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 2);
  const cards = [];
  const seen = new Set();

  const addCard = (question, answer) => {
    const q = question.trim();
    const a = answer.trim();
    if (q.length < 3 || a.length < 2) return;
    if (seen.has(q.toLowerCase())) return;
    seen.add(q.toLowerCase());
    cards.push({ question: q, answer: a });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Pattern 1: Term = Definition
    const eqMatch = line.match(/^(.{2,60}?)\s*=\s*(.{2,})/);
    if (eqMatch) { addCard(`What is ${eqMatch[1]}?`, eqMatch[2]); continue; }

    // Pattern 2: Term: Definition (min 8 chars after colon)
    const colonMatch = line.match(/^(.{2,60}?)\s*:\s*(.{8,})/);
    if (colonMatch) { addCard(`What is ${colonMatch[1]}?`, colonMatch[2]); continue; }

    // Pattern 3: Term — Definition (em/en dash)
    const dashMatch = line.match(/^(.{2,60}?)\s*[—–]\s*(.{8,})/);
    if (dashMatch) { addCard(`What is ${dashMatch[1]}?`, dashMatch[2]); continue; }

    // Pattern 4: Term | Definition
    const pipeMatch = line.match(/^(.{2,60}?)\s*\|\s*(.{8,})/);
    if (pipeMatch) { addCard(`What is ${pipeMatch[1]}?`, pipeMatch[2]); continue; }

    // Pattern 5: Q: / A: format
    const qMatch = line.match(/^Q[:\.]?\s+(.+)/i);
    if (qMatch && lines[i + 1]) {
      const aMatch = lines[i + 1].match(/^A[:\.]?\s+(.+)/i);
      if (aMatch) { addCard(qMatch[1], aMatch[1]); i++; continue; }
    }

    // Pattern 6: Numbered "1. Term - definition"
    const numMatch = line.match(/^\d+[\.\)]\s+(.{2,50}?)\s*[-–:]\s*(.{8,})/);
    if (numMatch) { addCard(`What is ${numMatch[1]}?`, numMatch[2]); continue; }

    // Pattern 7: **bold** - definition
    const boldMatch = line.match(/\*\*(.{2,50}?)\*\*\s*[-–:]\s*(.{8,})/);
    if (boldMatch) { addCard(`What is ${boldMatch[1]}?`, boldMatch[2]); continue; }
  }

  return cards.slice(0, 25);
};

// ── AI-powered generation (Gemini) ────────────────────────────────────────────

const generateWithAI = async (noteContent, noteTitle) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('AI generation not configured (no Gemini API key)');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a flashcard generation expert. Generate flashcards from this study note.

Note Title: "${noteTitle}"
Note Content:
${noteContent}

IMPORTANT: Respond with ONLY a JSON array, no other text, no markdown, no backticks.
Example format: [{"question":"What is X?","answer":"X is..."},{"question":"What does Y mean?","answer":"Y means..."}]

Generate 5-10 flashcards covering the main concepts.`
        }]
      }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 2000,
        responseMimeType: "application/json"
      }
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error: ${response.status} — ${errText}`);
  }

  const data = await response.json();
  
  // Log full response for debugging
  console.log('🤖 Gemini raw response:', JSON.stringify(data).slice(0, 500));
  
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  if (!text) {
    console.error('❌ Empty Gemini response:', JSON.stringify(data));
    throw new Error('Gemini returned empty response');
  }

  console.log('📄 Gemini text:', text.slice(0, 300));

  // Try multiple parsing strategies
  let parsed = null;

  // Strategy 1: direct parse
  try {
    parsed = JSON.parse(text);
  } catch {}

  // Strategy 2: strip markdown code blocks
  if (!parsed) {
    try {
      const clean = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      parsed = JSON.parse(clean);
    } catch {}
  }

  // Strategy 3: extract JSON array with regex
  if (!parsed) {
    try {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) parsed = JSON.parse(match[0]);
    } catch {}
  }

  // Strategy 4: extract JSON object array manually
  if (!parsed) {
    try {
      const objects = [];
      const objRegex = /\{[^{}]*"question"\s*:\s*"([^"]+)"[^{}]*"answer"\s*:\s*"([^"]+)"[^{}]*\}/g;
      let match;
      while ((match = objRegex.exec(text)) !== null) {
        objects.push({ question: match[1], answer: match[2] });
      }
      if (objects.length > 0) parsed = objects;
    } catch {}
  }

  if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
    console.error('❌ All parsing strategies failed. Raw text:', text);
    throw new Error('Failed to parse Gemini response — try Pattern Matching mode instead');
  }

  // Validate and clean each card
  const cards = parsed
    .filter(card => card.question && card.answer)
    .map(card => ({
      question: String(card.question).trim(),
      answer: String(card.answer).trim(),
    }));

  console.log('✅ Successfully parsed', cards.length, 'cards');
  return cards;
};

// ── Service Functions ─────────────────────────────────────────────────────────
const getFlashcards = async (userId, { noteId, dueOnly, page = 1, limit = 50 }) => {
  const params = [userId];
  let whereClause = 'WHERE user_id = $1';

  if (noteId) { params.push(noteId); whereClause += ` AND note_id = $${params.length}`; }
  if (dueOnly) { whereClause += ' AND next_review_date <= NOW()'; }

  params.push(limit, (page - 1) * limit);

  const result = await pool.query(
    `SELECT *, COUNT(*) OVER() AS total_count
     FROM flashcards
     ${whereClause}
     ORDER BY next_review_date ASC
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  const total = result.rows[0]?.total_count || 0;
  return {
    flashcards: result.rows,
    pagination: { total: parseInt(total), page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const createFlashcard = async (userId, { noteId, question, answer }) => {
  const result = await pool.query(
    `INSERT INTO flashcards (user_id, note_id, question, answer)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [userId, noteId || null, question, answer]
  );
  return result.rows[0];
};

const bulkCreateFlashcards = async (userId, noteId, cards) => {
  if (cards.length === 0) return [];
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get existing questions for this user to prevent duplicates
    const existing = await client.query(
      `SELECT LOWER(question) as question FROM flashcards WHERE user_id = $1`,
      [userId]
    );
    const existingSet = new Set(existing.rows.map(r => r.question));

    const results = [];
    for (const card of cards) {
      const questionLower = card.question.toLowerCase().trim();
      if (existingSet.has(questionLower)) {
        console.log('⏭️ Skipping duplicate:', card.question);
        continue;
      }
      existingSet.add(questionLower); // prevent dupes within same batch
      const r = await client.query(
        `INSERT INTO flashcards (user_id, note_id, question, answer)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, noteId || null, card.question, card.answer]
      );
      results.push(r.rows[0]);
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const generateFlashcards = async (userId, noteId, mode = 'rule') => {
  const noteResult = await pool.query(
    'SELECT id, title, content FROM notes WHERE id = $1 AND user_id = $2',
    [noteId, userId]
  );

  if (noteResult.rows.length === 0) {
    const err = new Error('Note not found');
    err.statusCode = 404;
    throw err;
  }

  const note = noteResult.rows[0];
  const plainContent = stripHtml(note.content || '');

  console.log('📝 Stripped content preview:', plainContent.slice(0, 200));

  let cards;
  if (mode === 'ai' && process.env.GEMINI_API_KEY) {
    cards = await generateWithAI(plainContent, note.title);
  } else {
    cards = generateFromText(plainContent);
  }

  console.log('🃏 Cards before dedup:', cards.length);

  if (cards.length === 0) {
    return {
      generated: 0,
      flashcards: [],
      message: 'No patterns found. Use: "Term = Definition" or "Term: Definition" or try AI mode.'
    };
  }

  const saved = await bulkCreateFlashcards(userId, noteId, cards);
  
  return {
    generated: saved.length,
    skipped: cards.length - saved.length,
    flashcards: saved
  };
};

const reviewFlashcard = async (userId, flashcardId, rating) => {
  const result = await pool.query(
    'SELECT * FROM flashcards WHERE id = $1 AND user_id = $2',
    [flashcardId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Flashcard not found');
    err.statusCode = 404;
    throw err;
  }

  const card = result.rows[0];
  const updates = calculateNextReview(card, rating);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const updated = await client.query(
      `UPDATE flashcards SET
        ease_factor = $1, interval_days = $2, repetition_count = $3,
        last_review_date = $4, next_review_date = $5
       WHERE id = $6 AND user_id = $7 RETURNING *`,
      [updates.ease_factor, updates.interval_days, updates.repetition_count,
       updates.last_review_date, updates.next_review_date, flashcardId, userId]
    );

    try {
      await client.query(
        `INSERT INTO review_history (user_id, flashcard_id, rating) VALUES ($1, $2, $3)`,
        [userId, flashcardId, rating]
      );
    } catch (histErr) {
      console.warn('review_history insert skipped:', histErr.message);
    }

    await client.query('COMMIT');
    return updated.rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteFlashcard = async (userId, flashcardId) => {
  const result = await pool.query(
    'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING id',
    [flashcardId, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Flashcard not found');
    err.statusCode = 404;
    throw err;
  }
  return { id: flashcardId };
};

module.exports = {
  getFlashcards,
  createFlashcard,
  generateFlashcards,
  reviewFlashcard,
  deleteFlashcard,
  generateFromText,
};