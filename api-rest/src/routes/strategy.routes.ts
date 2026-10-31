import { Router } from 'express';
import { StrategyController } from '../controllers/strategy.controller';

const router = Router();

router.get('/', StrategyController.listStrategies);
router.get('/templates', StrategyController.getPredefinedTemplates);
router.get('/:id', StrategyController.getStrategyById);
router.post('/', StrategyController.createStrategy);
router.post('/:id/rate', StrategyController.rateStrategy);
router.post('/:id/comments', StrategyController.addComment);

export default router;

