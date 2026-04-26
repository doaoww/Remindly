const dashboardService = require('../services/dashboard.service');

const getStats = async (req, res, next) => {
  try {
    const data = await dashboardService.getDashboardStats(req.user.id);
    res.json({ success: true, data });
  } catch (err) { next(err); }
};

module.exports = { getStats };