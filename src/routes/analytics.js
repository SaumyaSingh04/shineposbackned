const express = require('express');
const { getAdvancedAnalytics, exportReport } = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get advanced analytics
router.get('/advanced', auth(['SUPER_ADMIN']), getAdvancedAnalytics);

// Export reports
router.get('/export', auth(['SUPER_ADMIN']), exportReport);

module.exports = router;