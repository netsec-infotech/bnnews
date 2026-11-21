import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { config } from '../config/index.js';
import { AuthenticatedRequest, JwtPayload } from '../types/index.js';

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'અનધિકૃત ઍક્સેસ: કૃપા કરીને લૉગિન કરો (Authentication required)' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'અમાન્ય અથવા સમાપ્ત થયેલ સત્ર (Invalid or expired token)' });
  }
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'લૉગિન આવશ્યક છે' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'આ ક્રિયા કરવા માટે તમારી પાસે પૂરતી પરવાનગી નથી (Insufficient permissions)',
      });
      return;
    }

    next();
  };
}
