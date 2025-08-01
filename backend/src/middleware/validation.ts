import { Request, Response, NextFunction } from 'express';

/**
 * Validation middleware for user profile updates
 */
export const validateProfileUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { name, picture } = req.body;

  // Validate name
  if (name !== undefined) {
    if (typeof name !== 'string') {
      res.status(400).json({ 
        error: 'Validation failed',
        details: 'Name must be a string'
      });
      return;
    }

    if (name.trim().length === 0) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: 'Name cannot be empty'
      });
      return;
    }

    if (name.length > 255) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: 'Name cannot exceed 255 characters'
      });
      return;
    }

    // TODO: Add profanity filter for user names
    // FIXME: Implement character encoding validation to prevent XSS
  }

  // Validate picture URL
  if (picture !== undefined) {
    if (picture !== null && typeof picture !== 'string') {
      res.status(400).json({ 
        error: 'Validation failed',
        details: 'Picture must be a string or null'
      });
      return;
    }

    if (picture && picture.length > 500) {
      res.status(400).json({ 
        error: 'Validation failed',
        details: 'Picture URL cannot exceed 500 characters'
      });
      return;
    }

    // Basic URL validation
    if (picture && picture.trim().length > 0) {
      try {
        new URL(picture);
      } catch {
        res.status(400).json({ 
          error: 'Validation failed',
          details: 'Picture must be a valid URL'
        });
        return;
      }
    }

    // TODO: Add image URL validation and security checks
    // FIXME: Validate image content-type and size before accepting
  }

  next();
};

/**
 * Validation middleware for API key input
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const { api_key } = req.body;

  if (!api_key) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'API key is required'
    });
    return;
  }

  if (typeof api_key !== 'string') {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'API key must be a string'
    });
    return;
  }

  const trimmedKey = api_key.trim();

  if (trimmedKey.length === 0) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'API key cannot be empty'
    });
    return;
  }

  // Google Places API key format validation (or test key format)
  const isGoogleFormat = trimmedKey.startsWith('AIza') && trimmedKey.length === 39;
  const isTestFormat = trimmedKey.startsWith('TEST_') && trimmedKey.length === 39 && /^TEST_[A-Z0-9_]{34}$/.test(trimmedKey);
  
  if (!isGoogleFormat && !isTestFormat) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'Invalid Google Places API key format. Should be 39 characters starting with "AIza"',
      example: 'AIzaSyExample1234567890abcdefghijklmno'
    });
    return;
  }

  // Check for potentially malicious characters
  if (!/^[A-Za-z0-9_-]+$/.test(trimmedKey)) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'API key contains invalid characters. Should only contain letters, numbers, hyphens, and underscores'
    });
    return;
  }

  // TODO: Add actual Google Places API validation call
  // FIXME: Implement API key usage quota check with Google API

  next();
};

/**
 * Validation middleware for account deletion
 */
export const validateAccountDeletion = (req: Request, res: Response, next: NextFunction): void => {
  const { confirmation } = req.body;

  if (!confirmation) {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'Confirmation string is required for account deletion'
    });
    return;
  }

  if (typeof confirmation !== 'string') {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'Confirmation must be a string'
    });
    return;
  }

  if (confirmation !== 'DELETE_MY_ACCOUNT') {
    res.status(400).json({ 
      error: 'Validation failed',
      details: 'Invalid confirmation string',
      required: 'DELETE_MY_ACCOUNT'
    });
    return;
  }

  // TODO: Add email verification step for account deletion
  // FIXME: Implement waiting period before actual deletion (GDPR requirement)

  next();
};

/**
 * Rate limiting validation (basic implementation)
 * TODO: Replace with proper rate limiting middleware like express-rate-limit
 */
export const validateRateLimit = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean up old entries
    for (const [key, value] of requests.entries()) {
      if (value.resetTime < windowStart) {
        requests.delete(key);
      }
    }

    const clientRequests = requests.get(clientId);

    if (!clientRequests) {
      requests.set(clientId, { count: 1, resetTime: now });
      next();
      return;
    }

    if (clientRequests.count >= maxRequests) {
      res.status(429).json({
        error: 'Rate limit exceeded',
        details: `Maximum ${maxRequests} requests per ${windowMs / 1000} seconds`,
        reset_in: Math.ceil((clientRequests.resetTime + windowMs - now) / 1000)
      });
      return;
    }

    clientRequests.count++;
    next();
  };
};

/**
 * General request sanitization middleware
 */
export const sanitizeInput = (req: Request, _res: Response, next: NextFunction): void => {
  // TODO: Implement comprehensive input sanitization
  // FIXME: Add XSS protection and SQL injection prevention

  // Basic string trimming for common fields
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }

  next();
}; 