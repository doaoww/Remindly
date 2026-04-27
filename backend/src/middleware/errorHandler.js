const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      message: 'Oops! This already exists.',
    });
  }

  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({
      success: false,
      message: 'Oops! Something is missing. Try refreshing the page.',
    });
  }

  // Auth errors
  if (err.statusCode === 401) {
    return res.status(401).json({
      success: false,
      message: err.message || 'Please log in again.',
    });
  }

  // Not found
  if (err.statusCode === 404) {
    return res.status(404).json({
      success: false,
      message: err.message || 'Oops! We couldn\'t find that.',
    });
  }

  // Validation / bad request
  if (err.statusCode === 400 || err.statusCode === 422) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || 'Oops! Something looks wrong with your request.',
    });
  }

  // Known app errors with custom messages (like Gemini errors)
  if (err.statusCode && err.statusCode < 500) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Everything else - generic friendly message
  res.status(500).json({
    success: false,
    message: err.message?.startsWith('Oops')
      ? err.message
      : 'Oops! Something went wrong on our end. Please try again.',
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Oops! That page doesn\'t exist.',
  });
};

module.exports = { errorHandler, notFound };