import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, Role, Permission } from '../models/index';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_trading_key_2026';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
    roles: string[];
    permissions: string[];
  };
}

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access token is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    
    // Fetch user and check active status
    const user = await User.findByPk(decoded.id, {
      include: [
        {
          model: Role,
          through: { attributes: [] },
          include: [
            {
              model: Permission,
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ error: 'Account suspended' });
      return;
    }

    // Extract roles and permissions
    const roles = (user as any).Roles?.map((r: any) => r.name) || [];
    const permissionsSet = new Set<string>();
    (user as any).Roles?.forEach((role: any) => {
      role.Permissions?.forEach((perm: any) => {
        permissionsSet.add(perm.name);
      });
    });

    req.user = {
      id: user.id,
      email: user.email,
      roles,
      permissions: Array.from(permissionsSet),
    };

    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden: Insufficient role privileges' });
      return;
    }

    next();
  };
};

export const requirePermission = (permission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const hasPermission = req.user.permissions.includes(permission);
    if (!hasPermission) {
      res.status(403).json({ error: 'Forbidden: Missing permission: ' + permission });
      return;
    }

    next();
  };
};

export const authenticate = authenticateJWT;
export const authorize = requireRole;

