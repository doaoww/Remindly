require('dotenv').config();
const pool = require('./pool');

const schema = `
  -- Extensions
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

  -- Users
  CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name   VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  -- Tags
  CREATE TABLE IF NOT EXISTS tags (
    id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name    VARCHAR(100) NOT NULL,
    color   VARCHAR(7) DEFAULT '#6366f1',
    UNIQUE(user_id, name)
  );

  -- Notes
  CREATE TABLE IF NOT EXISTS notes (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title      VARCHAR(500) NOT NULL DEFAULT 'Untitled',
    content    TEXT DEFAULT '',
    is_pinned  BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Note <-> Tag junction
  CREATE TABLE IF NOT EXISTS note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
  );

  -- Flashcards
  CREATE TABLE IF NOT EXISTS flashcards (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_id          UUID REFERENCES notes(id) ON DELETE SET NULL,
    question         TEXT NOT NULL,
    answer           TEXT NOT NULL,
    difficulty       SMALLINT DEFAULT 0,
    repetition_count INTEGER DEFAULT 0,
    ease_factor      NUMERIC(4,2) DEFAULT 2.5,
    interval_days    INTEGER DEFAULT 1,
    last_review_date TIMESTAMPTZ,
    next_review_date TIMESTAMPTZ DEFAULT NOW(),
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
  );

  -- Review history
  CREATE TABLE IF NOT EXISTS review_history (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    rating      VARCHAR(10) NOT NULL CHECK (rating IN ('easy', 'hard', 'again')),
    reviewed_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Indexes
  CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_notes_updated ON notes(updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
  CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review_date);
  CREATE INDEX IF NOT EXISTS idx_review_history_user ON review_history(user_id, reviewed_at DESC);
  CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id);

  -- Updated_at trigger function
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ language 'plpgsql';

  -- Attach triggers
  DROP TRIGGER IF EXISTS update_users_updated_at ON users;
  CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
  CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

  DROP TRIGGER IF EXISTS update_flashcards_updated_at ON flashcards;
  CREATE TRIGGER update_flashcards_updated_at
    BEFORE UPDATE ON flashcards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Running migrations...');
    await client.query(schema);
    console.log('✅ Migrations complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch(() => process.exit(1));