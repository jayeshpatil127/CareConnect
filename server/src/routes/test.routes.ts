import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/role.middleware';

const router = Router();

// General protected test endpoint
router.get('/protected', authenticateToken, (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Protected route accessed successfully',
    data: {
      user: req.user,
    },
  });
});

// Admin-only protected test endpoint
router.get('/admin', authenticateToken, authorizeRole('admin'), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Admin route accessed successfully',
    data: {
      user: req.user,
    },
  });
});

// Doctor-only protected test endpoint
router.get('/doctor', authenticateToken, authorizeRole('doctor'), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Doctor route accessed successfully',
    data: {
      user: req.user,
    },
  });
});

// Patient-only protected test endpoint
router.get('/patient', authenticateToken, authorizeRole('patient'), (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Patient route accessed successfully',
    data: {
      user: req.user,
    },
  });
});

export default router;
