import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/google/url', AuthController.getGoogleAuthUrl);
router.get('/google/callback', AuthController.handleGoogleCallback);
router.post('/guest-token', AuthController.issueGuestToken);

export default router;
