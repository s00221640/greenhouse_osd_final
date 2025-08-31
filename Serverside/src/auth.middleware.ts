import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Use the exact same SECRET_KEY as defined in your .env file
const SECRET_KEY = process.env.SECRET_KEY || 'super-secret-123';

export const authenticateKey = (req: Request, res: Response, next: NextFunction): void => {
  console.log('\n--- Auth Middleware ---');
  console.log('Headers:', JSON.stringify(req.headers));

  const authHeader = req.headers.authorization;
  
  if (!authHeader || authHeader === 'Bearer null') {
    console.log('No token provided in request');
    res.status(401).json({ message: 'No token provided. Unauthorized access.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    console.log('Token received:', token);
    console.log('Using SECRET_KEY for verification:', SECRET_KEY);  // Debug line - remove in production

    const decoded: any = jwt.decode(token);
    console.log('Token decoded (without verification):', decoded);

    const verified = jwt.verify(token, SECRET_KEY);
    console.log('Token verified successfully:', verified);

    if (!(verified as any)._id) {
      console.log('ERROR: No id property in verified token!');
      console.log('Token contains:', Object.keys(verified as object).join(', '));
      res.status(401).json({ message: 'Invalid token format. Missing user ID.' });
      return;
    }

    (req as any).user = verified;
    console.log('User object attached to request:', (req as any).user);
    console.log('--- End Auth Middleware ---\n');

    next();
  } catch (error) {
    console.error('Invalid token:', error);
    res.status(403).json({ message: 'Invalid token. Unauthorized access.' });
  }
};