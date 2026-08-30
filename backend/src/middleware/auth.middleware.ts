import { Request, Response, NextFunction } from 'express';
import { prisma } from '../services/prisma.service';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string | null;
      };
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check if user is logged in via session
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: req.session.userId },
      select: {
        id: true,
        email: true,
        name: true
      }
    });

    if (!user) {
      // Clear invalid session
      req.session.destroy(() => {});
      return res.status(401).json({
        status: 'error',
        message: 'User not found'
      });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Authentication error'
    });
  }
};

// Development only: Get or create the demo user
export const getDevUser = async () => {
  const devEmail = 'demo@email-scheduler.local';
  
  let user = await prisma.user.findUnique({
    where: { email: devEmail }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: devEmail,
        name: 'Demo User',
        googleId: 'demo_user_development' // Mark as dev user
      }
    });
    console.log('✅ Created development user:', user.email);
  }

  return user;
};