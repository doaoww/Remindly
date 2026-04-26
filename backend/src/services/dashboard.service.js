const pool = require('../db/pool');

const getDashboardStats = async (userId) => {
  const [stats, dueCards, weeklyReviews, recentNotes] = await Promise.all([
    // Total counts
    pool.query(
      `SELECT
        (SELECT COUNT(*) FROM notes WHERE user_id = $1) AS total_notes,
        (SELECT COUNT(*) FROM flashcards WHERE user_id = $1) AS total_flashcards,
        (SELECT COUNT(*) FROM flashcards WHERE user_id = $1 AND next_review_date <= NOW()) AS cards_due_today,
        (SELECT COUNT(DISTINCT DATE(reviewed_at)) FROM review_history WHERE user_id = $1) AS study_streak`,
      [userId]
    ),
    // Due cards preview
    pool.query(
      `SELECT id, question, answer, interval_days, repetition_count
       FROM flashcards
       WHERE user_id = $1 AND next_review_date <= NOW()
       ORDER BY next_review_date ASC
       LIMIT 5`,
      [userId]
    ),
    // Weekly review activity (last 7 days)
    pool.query(
      `SELECT
        DATE(reviewed_at) AS date,
        COUNT(*) AS count,
        COUNT(*) FILTER (WHERE rating = 'easy') AS easy,
        COUNT(*) FILTER (WHERE rating = 'hard') AS hard,
        COUNT(*) FILTER (WHERE rating = 'again') AS again
       FROM review_history
       WHERE user_id = $1 AND reviewed_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(reviewed_at)
       ORDER BY date ASC`,
      [userId]
    ),
    // Recent notes
    pool.query(
      `SELECT id, title, updated_at FROM notes WHERE user_id = $1 ORDER BY updated_at DESC LIMIT 5`,
      [userId]
    ),
  ]);

  return {
    stats: stats.rows[0],
    dueCards: dueCards.rows,
    weeklyActivity: weeklyReviews.rows,
    recentNotes: recentNotes.rows,
  };
};

module.exports = { getDashboardStats };