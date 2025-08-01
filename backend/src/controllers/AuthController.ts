import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { google } from 'googleapis';

interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  googleId: string;
}

interface AuthenticatedRequest extends Request {
  user?: User;
}

class AuthController {
  private oauth2Client: any;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Redirect to Google OAuth
   * GET /auth/google
   */
  redirectToGoogle = (_req: Request, res: Response): void => {
    try {
      const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/spreadsheets'
      ];

      const authUrl = this.oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
      });

      res.redirect(authUrl);
    } catch (error) {
      console.error('Error redirecting to Google:', error);
      res.status(500).json({ error: 'Failed to initiate Google OAuth' });
    }
  };

  /**
   * Handle OAuth callback and token exchange
   * GET /auth/callback
   */
  handleCallback = async (req: Request, res: Response): Promise<void> => {
    try {
      const { code } = req.query;

      if (!code || typeof code !== 'string') {
        res.status(400).json({ error: 'Authorization code is required' });
        return;
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Get user info from Google
      const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
      const userInfo = await oauth2.userinfo.get();

      if (!userInfo.data.email) {
        res.status(400).json({ error: 'Email not provided by Google' });
        return;
      }

      // Create user object
      const user: User = {
        id: userInfo.data.id || '',
        email: userInfo.data.email,
        name: userInfo.data.name || '',
        picture: userInfo.data.picture || undefined,
        googleId: userInfo.data.id || ''
      };

      // Generate JWT token
      const jwtToken = this.generateJWT(user);

      // FIXME: CRITICAL - Store refresh token in database for session management
      // TODO: Implement refresh token rotation for security
      // Store refresh token for later use (you'll want to store this in database)

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/success?token=${jwtToken}`);

    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/error`);
    }
  };

  /**
   * Generate JWT token for user
   */
  generateJWT = (user: User): string => {
    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      googleId: user.googleId
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // FIXME: Remove type assertion and fix JWT typing issue properly
    return jwt.sign(payload, secret, { expiresIn } as any);
  };

  /**
   * Refresh JWT token
   * POST /auth/refresh
   */
  refreshToken = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      // Generate new JWT token
      const newToken = this.generateJWT(user);

      res.json({
        success: true,
        token: newToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (error) {
      console.error('Error refreshing token:', error);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  };

  /**
   * Logout user
   * POST /auth/logout
   */
  logout = async (_req: Request, res: Response): Promise<void> => {
    try {
      // For JWT, logout is handled on the client side by removing the token
      // In a more complex setup, you might maintain a blacklist of tokens
      
      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Error during logout:', error);
      res.status(500).json({ error: 'Failed to logout' });
    }
  };

  /**
   * Get current user info
   * GET /auth/me
   */
  getCurrentUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const user = req.user;
      
      if (!user) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });

    } catch (error) {
      console.error('Error getting current user:', error);
      res.status(500).json({ error: 'Failed to get user info' });
    }
  };
}

export default AuthController; 