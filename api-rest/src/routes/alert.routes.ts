import { Router } from 'express';
import { AlertController } from '../controllers/alert.controller';

const router = Router();

router.get('/', AlertController.listAlerts);
router.post('/', AlertController.createAlert);

export default router;

