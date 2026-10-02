import { Router, Response } from 'express';
import { db } from '../database';
import {
  generateToken,
  hashPassword,
  verifyPassword,
  authMiddleware,
  AuthenticatedRequest
} from '../auth';

export const authRouter = Router();

// POST /api/v1/auth/register
authRouter.post('/register', (req, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: {
          name: !name ? 'Name is required' : '',
          email: !email ? 'Email is required' : '',
          password: !password ? 'Password is required' : ''
        }
      });
      return;
    }

    if (password.length < 6) {
      res.status(422).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
      return;
    }

    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
      return;
    }

    const password_hash = hashPassword(password);
    const newUser = db.createUser({
      name,
      email: email.trim().toLowerCase(),
      password_hash,
      phone: phone || '',
      role: 'user',
      status: 'active'
    });

    // Auto-create initial trial subscription
    db.upsertSubscription(newUser.id, 'plan_free_trial', 'manual');

    // Audit log
    db.logAudit({
      user_id: newUser.id,
      action: 'auth.registered',
      entity_type: 'user',
      entity_id: newUser.id,
      ip_address: req.ip
    });

    const token = generateToken(newUser);

    const { password_hash: _, ...safeUser } = newUser;
    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration',
      errors: { server: err.message }
    });
  }
});

// POST /api/v1/auth/login
authRouter.post('/login', (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(422).json({
        success: false,
        message: 'Email and password are required.'
      });
      return;
    }

    const user = db.findUserByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or credentials.'
      });
      return;
    }

    if (user.status === 'deactivated' || user.status === 'suspended') {
      res.status(403).json({
        success: false,
        message: `Your account is ${user.status}. Please contact support.`
      });
      return;
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        message: 'Invalid email address or credentials.'
      });
      return;
    }

    // Update last login
    db.updateUser(user.id, { last_login_at: new Date().toISOString() });

    db.logAudit({
      user_id: user.id,
      action: 'auth.login',
      entity_type: 'user',
      entity_id: user.id,
      ip_address: req.ip
    });

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Signed in successfully.',
      data: {
        user: safeUser,
        token
      }
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during login',
      errors: { server: err.message }
    });
  }
});

// POST /api/v1/auth/logout
authRouter.post('/logout', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (req.user) {
    db.logAudit({
      user_id: req.user.id,
      action: 'auth.logout',
      entity_type: 'user',
      entity_id: req.user.id,
      ip_address: req.ip
    });
  }
  res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

// GET /api/v1/auth/me
authRouter.get('/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { password_hash: _, ...safeUser } = req.user;
  const businesses = db.findBusinessesByUserId(req.user.id);
  const subscription = db.findSubscriptionByUserId(req.user.id);

  res.json({
    success: true,
    message: 'Profile retrieved successfully.',
    data: {
      user: safeUser,
      businesses,
      subscription
    }
  });
});

// PUT /api/v1/auth/profile
authRouter.put('/profile', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { phone } = req.body;
  const updated = db.updateUser(req.user.id, { phone: phone || '' });

  if (!updated) {
    res.status(404).json({ success: false, message: 'User not found' });
    return;
  }

  db.logAudit({
    user_id: req.user.id,
    action: 'profile.updated',
    entity_type: 'user',
    entity_id: req.user.id,
    new_values: { phone },
    ip_address: req.ip
  });

  const { password_hash: _, ...safeUser } = updated;
  res.json({
    success: true,
    message: 'Phone number updated successfully.',
    data: { user: safeUser }
  });
});

// POST /api/v1/auth/change-password
authRouter.post('/change-password', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { current_password, new_password } = req.body;
  if (!current_password || !new_password) {
    res.status(422).json({ success: false, message: 'Current and new password are required.' });
    return;
  }

  const isValid = verifyPassword(current_password, req.user.password_hash);
  if (!isValid) {
    res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    return;
  }

  if (new_password.length < 6) {
    res.status(422).json({ success: false, message: 'New password must be at least 6 characters long.' });
    return;
  }

  const password_hash = hashPassword(new_password);
  db.updateUser(req.user.id, { password_hash });

  db.logAudit({
    user_id: req.user.id,
    action: 'password.changed',
    entity_type: 'user',
    entity_id: req.user.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Password changed successfully.'
  });
});

// POST /api/v1/auth/deactivate
authRouter.post('/deactivate', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  db.updateUser(req.user.id, { status: 'deactivated' });

  db.logAudit({
    user_id: req.user.id,
    action: 'account.deactivated',
    entity_type: 'user',
    entity_id: req.user.id,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Your ReviewFlow AI account has been deactivated.'
  });
});

// POST /api/v1/auth/delete
authRouter.post('/delete', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  const { confirmation } = req.body;
  if (confirmation !== 'DELETE') {
    res.status(422).json({
      success: false,
      message: 'Please type DELETE in uppercase to confirm permanent deletion.'
    });
    return;
  }

  const userId = req.user.id;
  db.deleteUser(userId);

  db.logAudit({
    user_id: userId,
    action: 'account.deleted',
    entity_type: 'user',
    entity_id: userId,
    ip_address: req.ip
  });

  res.json({
    success: true,
    message: 'Your account has been permanently removed.'
  });
});
