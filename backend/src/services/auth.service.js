const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const SALT_ROUNDS = 12;

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const register = async ({ email, password, fullName }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already in use');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at`,
    [email.toLowerCase(), passwordHash, fullName || null]
  );

  const user = result.rows[0];
  const token = generateToken(user.id);

  // Create default tags for new user
  await pool.query(
    `INSERT INTO tags (user_id, name, color) VALUES
     ($1, 'Mathematics', '#f59e0b'),
     ($1, 'Science', '#10b981'),
     ($1, 'History', '#8b5cf6'),
     ($1, 'Languages', '#ef4444')
     ON CONFLICT DO NOTHING`,
    [user.id]
  );

  return { user, token };
};

const login = async ({ email, password }) => {
  const result = await pool.query(
    'SELECT id, email, full_name, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = generateToken(user.id);
  const { password_hash, ...safeUser } = user;

  return { user: safeUser, token };
};

module.exports = { register, login };