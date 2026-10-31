import { Router } from 'express';
import { ServiceRequestController } from '../controllers/serviceRequest.controller';

const router = Router();

router.post('/', ServiceRequestController.createRequest);
router.get('/', ServiceRequestController.listRequests);

export default router;
