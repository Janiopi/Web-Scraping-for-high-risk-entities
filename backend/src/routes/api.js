import express from 'express';
import { search, validateSearch } from '../controllers/searchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/search', authenticate, validateSearch, search);

export default router;
