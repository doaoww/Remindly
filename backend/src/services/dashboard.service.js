const pool = require('../db/pool');

const getDashboardStats = async (userId) => {
  const [stats, dueCards, weeklyReviews, recentNotes] = await Promise.all([
    // Total counts
    pool.query(
      `SELECT
        (SELECT COUNT(*) FROM notes WHERE user_id = $1)::int AS total_notes,
        (SELECT COUNT(*) FROM flashcards WHERE user_id = $1)::int AS total_flashcards,
        (SELECT COUNT(*) FROM flashcards WHERE user_id = $1 AND next_review_date <= NOW())::int AS cards_due_today,
        (SELECT COUNT(DISTINCT DATE(reviewed_at AT TIME ZONE 'UTC')) FROM review_history WHERE user_id = $1)::int AS study_streak`,
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

    // Weekly reviews — last 7 days, grouped by UTC date
    pool.query(
      `SELECT
        DATE(reviewed_at AT TIME ZONE 'UTC') AS date,
        COUNT(*)::int AS count,
        COUNT(*) FILTER (WHERE rating = 'easy')::int AS easy,
        COUNT(*) FILTER (WHERE rating = 'hard')::int AS hard,
        COUNT(*) FILTER (WHERE rating = 'again')::int AS again
       FROM review_history
       WHERE user_id = $1
         AND reviewed_at >= NOW() - INTERVAL '7 days'
       GROUP BY DATE(reviewed_at AT TIME ZONE 'UTC')
       ORDER BY date ASC`,
      [userId]
    ),

    // Recent notes — max 5
    pool.query(
      `SELECT id, title, updated_at
       FROM notes
       WHERE user_id = $1
       ORDER BY updated_at DESC
       LIMIT 5`,
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