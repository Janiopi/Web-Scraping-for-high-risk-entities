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
  query('sources')
    .optional()
    .isArray()
    .withMessage('Sources must be an array')
    .custom((sources) => {
      const availableSources = ['OffshoreLeaksScraper', 'Ofac', 'TheWorldBank'];
      const invalidSources = sources.filter(
        (source) => !availableSources.includes(source)
      );
      if (invalidSources.length > 0) {
        throw new Error(`Invalid sources: ${invalidSources.join(', ')}`);
      }
      return true;
    }),
];

export const search = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { entityName, sources } = req.query;

    if (!entityName || entityName.trim() === '') {
      return res.status(400).json({
        error: 'Entity name is required',
        message: 'Please provide an entity name to search',
      });
    }

    // Parse sources if provided (query params come as strings)
    let selectedSources = null;
    if (sources) {
      selectedSources = Array.isArray(sources) ? sources : [sources];
    }

    // Search with selected sources (or all if none specified)
    const result = await searchService.search(entityName, selectedSources);

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

// Get available sources endpoint
export const getSources = async (req, res) => {
  try {
    const sources = searchService.getAvailableSources();

    return res.status(200).json({
      success: true,
      data: sources,
      message: 'Available sources retrieved successfully',
    });
  } catch (error) {
    console.error('Get sources error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'An error occurred while retrieving sources',
      details:
        process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
