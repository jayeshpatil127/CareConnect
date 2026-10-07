import { Request, Response, NextFunction } from 'express';
import { validateRegisterInput, validateLoginInput } from '../validators/auth.validator';
import { AuthService } from '../services/auth.service';

export class AuthController {
  public static async register(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Strictly validate and sanitize input fields
      const validatedData = validateRegisterInput(req.body);

      // 2. Delegate to service for business logic and database persistence
      const user = await AuthService.register(validatedData);

      // 3. Return standardized 201 Created response
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async login(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1. Strictly validate login input fields (email format, password present)
      const validatedData = validateLoginInput(req.body);

      // 2. Delegate to service for credential verification and JWT generation
      const result = await AuthService.login(validatedData);

      // 3. Return standardized 200 OK response
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getMe(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await AuthService.getMe(req.user!.userId);
      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

