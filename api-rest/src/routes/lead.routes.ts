import { Router } from 'express';
import { LeadController } from '../controllers/lead.controller';

const router = Router();

router.post('/', LeadController.captureLead);
router.get('/', LeadController.listLeads);

export default router;

