import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { allowRoles } from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';
import { sendChatbotMessage, getChatbotHistory } from '../controllers/chatbotController.js';

const router = express.Router();

router.get('/history', protect, allowRoles(ROLES.CUSTOMER), getChatbotHistory);
router.post('/message', protect, allowRoles(ROLES.CUSTOMER), sendChatbotMessage);

export default router;
