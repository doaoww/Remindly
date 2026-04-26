const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const result = await authService.register({ email, password, fullName });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
};

module.exports = { register, login, getMe };