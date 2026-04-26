const pool = require('../db/pool');

const getNotes = async (userId, { search, tagId, page = 1, limit = 20 }) => {
  const offset = (page - 1) * limit;
  const params = [userId];
  let whereClause = 'WHERE n.user_id = $1';

  if (search) {
    params.push(`%${search}%`);
    whereClause += ` AND (n.title ILIKE $${params.length} OR n.content ILIKE $${params.length})`;
  }

  if (tagId) {
    params.push(tagId);
    whereClause += ` AND EXISTS (
      SELECT 1 FROM note_tags nt WHERE nt.note_id = n.id AND nt.tag_id = $${params.length}
    )`;
  }

  const query = `
    SELECT
      n.id, n.title, n.content, n.is_pinned, n.created_at, n.updated_at,
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name, 'color', t.color)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags,
      COUNT(*) OVER() AS total_count
    FROM notes n
    LEFT JOIN note_tags nt ON nt.note_id = n.id
    LEFT JOIN tags t ON t.id = nt.tag_id
    ${whereClause}
    GROUP BY n.id
    ORDER BY n.is_pinned DESC, n.updated_at DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  params.push(limit, offset);
  const result = await pool.query(query, params);

  const total = result.rows[0]?.total_count || 0;

  return {
    notes: result.rows,
    pagination: {
      total: parseInt(total),
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getNoteById = async (userId, noteId) => {
  const result = await pool.query(
    `SELECT
      n.id, n.title, n.content, n.is_pinned, n.created_at, n.updated_at,
      COALESCE(
        json_agg(
          json_build_object('id', t.id, 'name', t.name, 'color', t.color)
        ) FILTER (WHERE t.id IS NOT NULL),
        '[]'
      ) AS tags
    FROM notes n
    LEFT JOIN note_tags nt ON nt.note_id = n.id
    LEFT JOIN tags t ON t.id = nt.tag_id
    WHERE n.id = $1 AND n.user_id = $2
    GROUP BY n.id`,
    [noteId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Note not found');
    err.statusCode = 404;
    throw err;
  }

  return result.rows[0];
};

const createNote = async (userId, { title, content, tagIds = [], isPinned = false }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const noteResult = await client.query(
      `INSERT INTO notes (user_id, title, content, is_pinned)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, title || 'Untitled', content || '', isPinned]
    );

    const note = noteResult.rows[0];

    if (tagIds.length > 0) {
      const tagValues = tagIds.map((tagId, i) => `($1, $${i + 2})`).join(', ');
      await client.query(
        `INSERT INTO note_tags (note_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
        [note.id, ...tagIds]
      );
    }

    await client.query('COMMIT');
    return getNoteById(userId, note.id);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const updateNote = async (userId, noteId, { title, content, tagIds, isPinned }) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Build dynamic SET clause
    const updates = [];
    const params = [noteId, userId];
    if (title !== undefined) { params.push(title); updates.push(`title = $${params.length}`); }
    if (content !== undefined) { params.push(content); updates.push(`content = $${params.length}`); }
    if (isPinned !== undefined) { params.push(isPinned); updates.push(`is_pinned = $${params.length}`); }

    if (updates.length > 0) {
      await client.query(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2`,
        params
      );
    }

    // Replace tags if provided
    if (tagIds !== undefined) {
      await client.query('DELETE FROM note_tags WHERE note_id = $1', [noteId]);
      if (tagIds.length > 0) {
        const tagValues = tagIds.map((tagId, i) => `($1, $${i + 2})`).join(', ');
        await client.query(
          `INSERT INTO note_tags (note_id, tag_id) VALUES ${tagValues} ON CONFLICT DO NOTHING`,
          [noteId, ...tagIds]
        );
      }
    }

    await client.query('COMMIT');
    return getNoteById(userId, noteId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteNote = async (userId, noteId) => {
  const result = await pool.query(
    'DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING id',
    [noteId, userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('Note not found');
    err.statusCode = 404;
    throw err;
  }

  return { id: noteId };
};

module.exports = { getNotes, getNoteById, createNote, updateNote, deleteNote };