import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';

const router = Router();

// Platform usage, LLM consumption, and integrations health
router.get('/overview', AdminController.getOverview);

// Strategy management CRUD
router.get('/strategies', AdminController.listStrategies);
router.post('/strategies', AdminController.createStrategy);
router.put('/strategies/:id', AdminController.updateStrategy);
router.delete('/strategies/:id', AdminController.deleteStrategy);

export default router;
