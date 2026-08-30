import session from 'express-session';

export const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'dev-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax' as const
  }
};

// Development session configuration
export const getSessionConfig = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      ...sessionConfig,
      cookie: {
        ...sessionConfig.cookie,
        secure: false, // Allow HTTP in development
      }
    };
  }
  return sessionConfig;
};