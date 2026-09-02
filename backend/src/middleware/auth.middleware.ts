import {type Request,type Response,type NextFunction} from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
    userId: string;
    role: string;
}

//Extend Express's Request type so TypeScript knows req.user can exist
declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}   

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.token;   // was: reading the Authorization header

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}
