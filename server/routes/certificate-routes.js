const express = require('express');
const router = express.Router();
const {
  checkEligibility,
  generateCertificateController,
  downloadCertificate,
  getCertificates
} = require('../controllers/certificate-controller');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// All certificate routes require authentication and student role
router.use(authMiddleware);
router.use(roleMiddleware(['student']));

// Check eligibility for certificate
router.get('/eligibility/:courseId', checkEligibility);

// Generate certificate if eligible
router.post('/generate/:courseId', generateCertificateController);

// Download certificate
router.get('/download/:certificateId', downloadCertificate);

// Get student's certificates
router.get('/', getCertificates);

module.exports = router;
