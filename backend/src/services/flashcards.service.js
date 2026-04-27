const pool = require('../db/pool');

// ── HTML Stripper ─────────────────────────────────────────────────────────────
const stripHtml = (html) => {
  if (!html) return '';
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
  let ease_factor = parseFloat(card.ease_factor);
  let interval_days = card.interval_days;
  let repetition_count = card.repetition_count;

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
  const lines = text.split('\n').map(function(l) { return l.trim(); }).filter(function(l) { return l.length > 2; });
  const cards = [];
  const seen = new Set();

  const addCard = function(question, answer) {
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
    if (eqMatch) { addCard('What is ' + eqMatch[1] + '?', eqMatch[2]); continue; }

    // Pattern 2: Term: Definition (min 8 chars after colon)
    const colonMatch = line.match(/^(.{2,60}?)\s*:\s*(.{8,})/);
    if (colonMatch) { addCard('What is ' + colonMatch[1] + '?', colonMatch[2]); continue; }

    // Pattern 3: Term — Definition (em/en dash)
    const dashMatch = line.match(/^(.{2,60}?)\s*[—–]\s*(.{8,})/);
    if (dashMatch) { addCard('What is ' + dashMatch[1] + '?', dashMatch[2]); continue; }

    // Pattern 4: Term | Definition
    const pipeMatch = line.match(/^(.{2,60}?)\s*\|\s*(.{8,})/);
    if (pipeMatch) { addCard('What is ' + pipeMatch[1] + '?', pipeMatch[2]); continue; }

    // Pattern 5: Q: / A: format
    const qMatch = line.match(/^Q[:\.]?\s+(.+)/i);
    if (qMatch && lines[i + 1]) {
      const aMatch = lines[i + 1].match(/^A[:\.]?\s+(.+)/i);
      if (aMatch) { addCard(qMatch[1], aMatch[1]); i++; continue; }
    }

    // Pattern 6: Numbered "1. Term - definition"
    const numMatch = line.match(/^\d+[\.\)]\s+(.{2,50}?)\s*[-–:]\s*(.{8,})/);
    if (numMatch) { addCard('What is ' + numMatch[1] + '?', numMatch[2]); continue; }

    // Pattern 7: **bold** - definition
    const boldMatch = line.match(/\*\*(.{2,50}?)\*\*\s*[-–:]\s*(.{8,})/);
    if (boldMatch) { addCard('What is ' + boldMatch[1] + '?', boldMatch[2]); continue; }
  }

  return cards.slice(0, 25);
};

// ── AI-powered generation (Gemini) ────────────────────────────────────────────
const generateWithAI = async function(noteContent, noteTitle, retries) {
  if (retries === undefined) retries = 3;

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Oops! AI generation is not set up correctly. Try Pattern Matching instead.');
  }

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log('🤖 Gemini attempt ' + attempt + '/' + retries);

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'You are a flashcard generation expert. Generate flashcards from this study note.\n\nNote Title: "' + noteTitle + '"\nNote Content:\n' + noteContent + '\n\nIMPORTANT: Respond with ONLY a JSON array, no other text, no markdown, no backticks.\nExample: [{"question":"What is X?","answer":"X is..."}]\n\nGenerate 5-10 flashcards covering the main concepts.'
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          }
        }),
      });

      if (response.status === 503) {
        const waitMs = attempt * 2000;
        console.log('⏳ Gemini overloaded, waiting ' + waitMs + 'ms...');
        await new Promise(function(r) { setTimeout(r, waitMs); });
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error('Gemini error response:', errText);
        if (response.status === 503 || errText.includes('high demand') || errText.includes('UNAVAILABLE')) {
          if (attempt < retries) {
            await new Promise(function(r) { setTimeout(r, attempt * 2000); });
            continue;
          }
          throw new Error('Oops! AI is a bit busy right now. Try again in a minute or use Pattern Matching instead.');
        }
        throw new Error('Oops! Something went wrong with AI generation. Try Pattern Matching instead.');
      }

      const data = await response.json();
      const text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
        ? data.candidates[0].content.parts[0].text
        : '';

      if (!text) {
        throw new Error('Oops! AI returned an empty response. Please try again.');
      }

      console.log('📄 Gemini response preview:', text.slice(0, 150));

      // Parse strategies
      let parsed = null;

      try { parsed = JSON.parse(text); } catch (e) {}

      if (!parsed) {
        try {
          const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
          parsed = JSON.parse(clean);
        } catch (e) {}
      }

      if (!parsed) {
        try {
          const match = text.match(/\[[\s\S]*\]/);
          if (match) parsed = JSON.parse(match[0]);
        } catch (e) {}
      }

      if (!parsed || !Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Oops! AI returned something unexpected. Please try again.');
      }

      const result = parsed
        .filter(function(c) { return c.question && c.answer; })
        .map(function(c) {
          return {
            question: String(c.question).trim(),
            answer: String(c.answer).trim(),
          };
        });

      console.log('✅ Gemini generated ' + result.length + ' cards');
      return result;

    } catch (err) {
      console.error('Attempt ' + attempt + ' error:', err.message);

      if (attempt === retries) {
        if (err.message && err.message.startsWith('Oops')) {
          throw err;
        }
        throw new Error('Oops! Something went wrong. Please try again in a moment.');
      }

      await new Promise(function(r) { setTimeout(r, attempt * 1500); });
    }
  }
};

// ── Get Flashcards ────────────────────────────────────────────────────────────
const getFlashcards = async function(userId, options) {
  const noteId = options.noteId;
  const dueOnly = options.dueOnly;
  const page = options.page || 1;
  const limit = options.limit || 50;

  const params = [userId];
  let whereClause = 'WHERE user_id = $1';

  if (noteId) {
    params.push(noteId);
    whereClause += ' AND note_id = $' + params.length;
  }
  if (dueOnly) {
    whereClause += ' AND next_review_date <= NOW()';
  }

  params.push(limit);
  params.push((page - 1) * limit);

  const result = await pool.query(
    'SELECT *, COUNT(*) OVER() AS total_count FROM flashcards ' + whereClause + ' ORDER BY next_review_date ASC LIMIT $' + (params.length - 1) + ' OFFSET $' + params.length,
    params
  );

  const total = result.rows.length > 0 ? result.rows[0].total_count : 0;

  return {
    flashcards: result.rows,
    pagination: {
      total: parseInt(total),
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ── Create Flashcard ──────────────────────────────────────────────────────────
const createFlashcard = async function(userId, data) {
  const noteId = data.noteId || null;
  const question = data.question;
  const answer = data.answer;

  const result = await pool.query(
    'INSERT INTO flashcards (user_id, note_id, question, answer) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, noteId, question, answer]
  );

  return result.rows[0];
};

// ── Bulk Create ───────────────────────────────────────────────────────────────
const bulkCreateFlashcards = async function(userId, noteId, cards) {
  if (!cards || cards.length === 0) return [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get existing questions to prevent duplicates
    const existing = await client.query(
      'SELECT LOWER(question) as question FROM flashcards WHERE user_id = $1',
      [userId]
    );
    const existingSet = new Set(existing.rows.map(function(r) { return r.question; }));

    const results = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const questionLower = card.question.toLowerCase().trim();

      if (existingSet.has(questionLower)) {
        console.log('⏭️ Skipping duplicate:', card.question.slice(0, 50));
        continue;
      }

      existingSet.add(questionLower);

      const r = await client.query(
        'INSERT INTO flashcards (user_id, note_id, question, answer) VALUES ($1, $2, $3, $4) RETURNING *',
        [userId, noteId || null, card.question, card.answer]
      );
      results.push(r.rows[0]);
    }

    await client.query('COMMIT');
    return results;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Bulk create failed:', err.message);
    throw new Error('Oops! Failed to save flashcards. Please try again.');
  } finally {
    client.release();
  }
};

// ── Generate Flashcards ───────────────────────────────────────────────────────
const generateFlashcards = async function(userId, noteId, mode) {
  if (!mode) mode = 'rule';

  const noteResult = await pool.query(
    'SELECT id, title, content FROM notes WHERE id = $1 AND user_id = $2',
    [noteId, userId]
  );

  if (noteResult.rows.length === 0) {
    const err = new Error('Oops! Note not found. Try refreshing the page.');
    err.statusCode = 404;
    throw err;
  }

  const note = noteResult.rows[0];
  const plainContent = stripHtml(note.content || '');

  console.log('📝 Content preview:', plainContent.slice(0, 150));
  console.log('🔧 Mode:', mode);

  let cards;

  if (mode === 'ai' && process.env.GEMINI_API_KEY) {
    cards = await generateWithAI(plainContent, note.title);
  } else {
    cards = generateFromText(plainContent);
  }

  console.log('🃏 Cards before dedup:', cards.length);

  if (!cards || cards.length === 0) {
    return {
      generated: 0,
      skipped: 0,
      flashcards: [],
      message: 'No patterns found. Try "Term = Definition" format or switch to AI mode.',
    };
  }

  const saved = await bulkCreateFlashcards(userId, noteId, cards);

  return {
    generated: saved.length,
    skipped: cards.length - saved.length,
    flashcards: saved,
  };
};

// ── Review Flashcard ──────────────────────────────────────────────────────────
const reviewFlashcard = async function(userId, flashcardId, rating) {
  const result = await pool.query(
    'SELECT * FROM flashcards WHERE id = $1 AND user_id = $2',
    [flashcardId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Oops! Flashcard not found.');
    err.statusCode = 404;
    throw err;
  }

  const card = result.rows[0];
  const updates = calculateNextReview(card, rating);

  // Update flashcard
  const updated = await pool.query(
    'UPDATE flashcards SET ease_factor = $1, interval_days = $2, repetition_count = $3, last_review_date = $4, next_review_date = $5 WHERE id = $6 AND user_id = $7 RETURNING *',
    [
      updates.ease_factor,
      updates.interval_days,
      updates.repetition_count,
      updates.last_review_date,
      updates.next_review_date,
      flashcardId,
      userId,
    ]
  );

  // Save review history separately so it never blocks the main update
  try {
    const hist = await pool.query(
      'INSERT INTO review_history (user_id, flashcard_id, rating) VALUES ($1, $2, $3) RETURNING id',
      [userId, flashcardId, rating]
    );
    console.log('✅ Review history saved:', hist.rows[0].id, rating);
  } catch (histErr) {
    console.error('❌ review_history failed:', histErr.message);
    // Don't throw — the review still counts
  }

  return updated.rows[0];
};

// ── Delete Flashcard ──────────────────────────────────────────────────────────
const deleteFlashcard = async function(userId, flashcardId) {
  const result = await pool.query(
    'DELETE FROM flashcards WHERE id = $1 AND user_id = $2 RETURNING id',
    [flashcardId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Oops! Flashcard not found.');
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