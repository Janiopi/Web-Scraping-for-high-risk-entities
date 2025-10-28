import express from 'express';
import {
  search,
  validateSearch,
  getSources,
} from '../controllers/searchController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get available sources
router.get('/sources', authenticate, getSources);

// Search endpoint with optional source selection
router.get('/search', authenticate, validateSearch, search);

export default router;
