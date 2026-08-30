import { Router, Request, Response } from 'express';
import { getDevUser, requireAuth } from '../middleware/auth.middleware';

const router = Router();

/**
 * DEVELOPMENT ONLY: Get current user
 * In production, this would use OAuth/JWT
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated'
      });
    }

    // Get user from database
    const user = await getDevUser();
    
    res.json({
      status: 'success',
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get user'
    });
  }
});

/**
 * DEVELOPMENT ONLY: Login with dev user
 * In production, this would be OAuth/SSO
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    // Get or create the development user
    const user = await getDevUser();
    
    // Set session
    req.session.userId = user.id;
    
    res.json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to login'
    });
  }
});

/**
 * Logout user
 */
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to logout'
      });
    }
    res.json({
      status: 'success',
      message: 'Logged out successfully'
    });
  });
});

/**
 * Protected test route
 */
router.get('/protected', requireAuth, (req: Request, res: Response) => {
  res.json({
    status: 'success',
    message: 'You are authenticated!',
    user: req.user
  });
});

export default router;