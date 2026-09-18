import { Router } from 'express';
import { SignUpSchema, LoginSchema, UserRole } from '@captionstudio/types';

export const authRouter = Router();

authRouter.post('/signup', async (req, res, next) => {
  try {
    const data = SignUpSchema.parse(req.body);
    // In Phase 1 foundation: return mock registered session
    res.status(201).json({
      success: true,
      data: {
        user: {
          id: 'usr_new_123',
          email: data.email,
          name: data.name,
          role: UserRole.CREATOR,
          createdAt: new Date().toISOString(),
        },
        token: 'cs_session_token_example',
      },
      message: 'Account created successfully. Please verify your email.',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const data = LoginSchema.parse(req.body);
    res.json({
      success: true,
      data: {
        user: {
          id: 'usr_alex_123',
          email: data.email,
          name: 'Alex Rivera',
          role: UserRole.CREATOR,
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
        },
        token: 'cs_session_token_example',
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

authRouter.get('/me', (req, res) => {
  res.json({
    success: true,
    data: req.user || {
      id: 'usr_alex_123',
      email: 'alex.creator@captionstudio.io',
      name: 'Alex Rivera',
      role: UserRole.CREATOR,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    },
    timestamp: new Date().toISOString(),
  });
});

