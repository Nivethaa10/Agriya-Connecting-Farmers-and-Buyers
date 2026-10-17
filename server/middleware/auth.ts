import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.ts';

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return secret;
}

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

function getSessionCookie(req: AuthenticatedRequest): string | undefined {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;

  const sessionCookie = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('agriya_session='));

  if (!sessionCookie) return undefined;
  const value = sessionCookie.slice('agriya_session='.length);
  try {
    return decodeURIComponent(value);
  } catch {
    return undefined;
  }
}

export function generateToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
      role: user.role,
    },
    getJwtSecret(),
    { expiresIn: '7d' }
  );
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.slice('Bearer '.length)
      : undefined;
    const cookieToken = getSessionCookie(req);
    const tokens = [bearerToken, cookieToken].filter(
      (token): token is string => Boolean(token)
    );

    if (tokens.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token missing. Please sign in.',
      });
    }

    let decoded: jwt.JwtPayload | undefined;
    for (const token of tokens) {
      try {
        const payload = jwt.verify(token, getJwtSecret());
        if (typeof payload === 'object' && payload !== null) {
          decoded = payload;
          break;
        }
      } catch {
        // Continue to the cookie token when a legacy bearer token is stale.
      }
    }

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Session expired or token invalid. Please log in again.',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User account not found. Please log in again.',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account has been deactivated. Please contact support.',
      });
    }

    req.user = user;
    next();
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden. You do not have permission to perform this action. Required role: [${roles.join(', ')}]`,
      });
    }

    next();
  };
}
