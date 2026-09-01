import {Request, Response, NextFunction} from 'express';
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
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No Token Provided' });
    }

    const token = authHeader.split(' ')[1];

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as AuthPayload;
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }