import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';

const router = Router();

// Introspect ephemeral schema (DB or uploaded file)
router.post('/schema', uploadMiddleware.array('files', 5), AnalyticsController.getSchema);

// Execute Text-to-SQL or raw query with Zero-Retention and SQL Firewall
router.post('/query', uploadMiddleware.array('files', 5), AnalyticsController.executeAnalyticsQuery);

export default router;

