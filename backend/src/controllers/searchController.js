import { SearchService } from '../services/searchService.js';
import { validationResult, query } from 'express-validator';

// Create SearchService instance
const searchService = new SearchService();

// Validation middleware for search endpoint
export const validateSearch = [
  query('entityName')
    .notEmpty()
    .withMessage('Entity name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Entity name must be between 2 and 100 characters')
    .escape(), // Sanitize to prevent XSS
];

export const search = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entityName } = req.query;

    if (!entityName || entityName.trim() === '') {
      return res.status(400).json({
        error: 'Entity name is required',
        message: 'Please provide an entity name to search',
      });
    }

    // Search in the three sources
    const result = await searchService.search(entityName);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Search completed successfully',
    });
  } catch (error) {
    console.error('Search error:', error);

    // Different status codes for different error types
    if (error.message.includes('Entity name is required')) {
      return res.status(400).json({
        success: false,
        error: 'Validation Error',
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while processing the search',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
