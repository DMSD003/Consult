import { Router } from 'express';
import  { authenticate } from '../middlewares/auth.middlewares';
import { validateNewAnalyse } from '../middlewares/analyse.project.middleware';
import { newAnalyseDataSchema } from '../zod.schemas/analyse.schema'
import { AnalyseController } from '../controllers/analyse.controller';

const router = Router();
const analyseController = new AnalyseController();

router.post('/analyse', authenticate, validateNewAnalyse(newAnalyseDataSchema), analyseController.newConversation);

export default router;
