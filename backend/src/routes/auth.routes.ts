import { Router } from 'express';
import { validateCookies, authenticate, authenticateRefresh, validateRegistrationInfo, validateLoginInfo } from '../middlewares/auth.middlewares';
import { guestSchema, registrationSchema, loginSchema } from '../zod.schemas/auth.shemas';
import { AuthController } from '../controllers/auth.controllers'
const router = Router();
const authController = new AuthController();

/**
 *  Public route for the first contact with the app
 * Gets all user's session data or create new user
 * @route POST /api/scan/session
 * @validatedCookieparam {string} sessionId - The id of the session of the user
 * @returns  {200} { data: Object } - The service successfully got data of a user's session 
 * @returns {500} {error: string} - If An internal server error happens
 * 
*/
router.get('/session', validateCookies(guestSchema), authController.createOrSendSession);

router.post('/register', validateRegistrationInfo(registrationSchema), authenticate, authController.register);

router.post('/login', validateLoginInfo(loginSchema), authenticate, authController.login);

router.post('/refresh', authenticateRefresh, authController.refesh);

export default router;