import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './database';
import { User } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'reviewflow_super_secret_jwt_key_2026_prod';
const JWT_EXPIRES_IN = '7d';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function hashPassword(plainText: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(plainText, salt);
}

export function verifyPassword(plainText: string, hash: string): boolean {
  return bcrypt.compareSync(plainText, hash);
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Authentication required. Please provide a valid Bearer token.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = db.findUserById(decoded.id);

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'User account not found or has been revoked.'
      });
      return;
    }

    if (user.status === 'deactivated' || user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: `Account is currently ${user.status}. Please contact support.`
      });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired authentication session token.'
    });
  }
}

export function requireRole(roles: Array<'user' | 'admin' | 'agency' | 'staff'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. You do not have permission to perform this action.'
      });
      return;
    }

    next();
  };
}

export type AdminPermission =
  | 'users.view'
  | 'users.manage'
  | 'users.suspend'
  | 'businesses.view'
  | 'businesses.manage'
  | 'funnels.view'
  | 'reviews.view'
  | 'google.view'
  | 'google.manage'
  | 'ai.view'
  | 'ai.manage'
  | 'plans.view'
  | 'plans.manage'
  | 'subscriptions.view'
  | 'subscriptions.manage'
  | 'payments.view'
  | 'invoices.view'
  | 'billing.manage'
  | 'webhooks.view'
  | 'webhooks.retry'
  | 'usage.view'
  | 'usage.manage'
  | 'audit.view'
  | 'settings.view'
  | 'settings.manage'
  | 'feature_flags.view'
  | 'feature_flags.manage'
  | 'system.health'
  | 'system.jobs';

const ROLE_PERMISSIONS: Record<string, AdminPermission[]> = {
  super_admin: [
    'users.view', 'users.manage', 'users.suspend',
    'businesses.view', 'businesses.manage',
    'funnels.view', 'reviews.view',
    'google.view', 'google.manage',
    'ai.view', 'ai.manage',
    'plans.view', 'plans.manage',
    'subscriptions.view', 'subscriptions.manage',
    'payments.view', 'invoices.view',
    'webhooks.view', 'webhooks.retry',
    'usage.view', 'usage.manage',
    'audit.view',
    'settings.view', 'settings.manage',
    'feature_flags.view', 'feature_flags.manage',
    'system.health', 'system.jobs'
  ],
  admin: [
    'users.view', 'users.manage', 'users.suspend',
    'businesses.view', 'businesses.manage',
    'funnels.view', 'reviews.view',
    'google.view', 'google.manage',
    'ai.view', 'ai.manage',
    'plans.view', 'plans.manage',
    'subscriptions.view', 'subscriptions.manage',
    'payments.view', 'invoices.view',
    'webhooks.view', 'webhooks.retry',
    'usage.view', 'usage.manage',
    'audit.view',
    'settings.view', 'settings.manage',
    'feature_flags.view', 'feature_flags.manage',
    'system.health', 'system.jobs'
  ],
  support: [
    'users.view', 'users.manage',
    'businesses.view', 'businesses.manage',
    'funnels.view', 'reviews.view',
    'google.view',
    'ai.view',
    'audit.view',
    'feature_flags.view'
  ],
  finance: [
    'plans.view', 'plans.manage',
    'subscriptions.view', 'subscriptions.manage',
    'payments.view', 'invoices.view',
    'webhooks.view', 'webhooks.retry',
    'usage.view',
    'audit.view'
  ],
  analyst: [
    'users.view',
    'businesses.view',
    'funnels.view',
    'reviews.view',
    'google.view',
    'ai.view',
    'plans.view',
    'subscriptions.view',
    'payments.view',
    'invoices.view',
    'usage.view',
    'audit.view',
    'system.health'
  ]
};

export function hasPermission(user: User, permission: AdminPermission): boolean {
  if (user.role !== 'admin') {
    return false;
  }
  const effectiveRole = user.admin_role || 'admin';
  const permissions = ROLE_PERMISSIONS[effectiveRole] || [];
  return permissions.includes(permission);
}

export function adminMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  // First run authentication check
  authMiddleware(req, res, () => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied: Administrative privileges required.'
      });
      return;
    }

    next();
  });
}

export function requirePermission(permission: AdminPermission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required.' });
      return;
    }

    if (!hasPermission(req.user, permission)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Missing required administrative permission '${permission}'.`
      });
      return;
    }

    next();
  };
}

export function generateImpersonationToken(adminUser: User, targetUser: User): string {
  return jwt.sign(
    {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role,
      status: targetUser.status,
      impersonated_by: adminUser.id,
      impersonated_by_email: adminUser.email
    },
    JWT_SECRET,
    { expiresIn: '2h' } // 2 hour time-limited impersonation session
  );
}

