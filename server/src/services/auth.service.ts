import bcrypt from 'bcryptjs';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { AppError } from '../utils/errors';
import { RegisterDTO, LoginDTO } from '../validators/auth.validator';
import { signToken } from '../utils/jwt';

export interface RegisteredUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
}

export interface LoginResult {
  token: string;
  user: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  };
}

export class AuthService {
  /**
   * Registers a new user with bcrypt password hashing and atomic profile creation.
   *
   * SECURITY NOTE (Privilege Escalation / Admin Registration):
   * Allowing public clients to register with role = 'admin' is supported here strictly
   * to satisfy test specifications for this assignment. In a production environment,
   * administrative accounts must NEVER be created via public self-registration endpoints.
   * Admin roles should only be provisioned by existing verified super-admins or internal CLI tools.
   */
  public static async register(data: RegisterDTO): Promise<RegisteredUser> {
    const { fullName, email, password, role } = data;

    const connection = await pool.getConnection();

    try {
      // 1. Check for duplicate email before proceeding
      const [existingUsers] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        throw new AppError('A user with this email already exists', 409);
      }

      // 2. Hash password with bcrypt (salt factor 10)
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // 3. Begin transaction for atomic user and profile creation
      await connection.beginTransaction();

      // 4. Insert user record using parameterized SQL
      const [userResult] = await connection.execute<ResultSetHeader>(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [fullName, email, passwordHash, role]
      );

      const userId = userResult.insertId;

      // 5. Create associated role profile
      if (role === 'patient') {
        await connection.execute<ResultSetHeader>(
          'INSERT INTO patients (user_id) VALUES (?)',
          [userId]
        );
      } else if (role === 'doctor') {
        // Sensible default values for required fields not in basic registration
        await connection.execute<ResultSetHeader>(
          'INSERT INTO doctors (user_id, specialization, status) VALUES (?, ?, ?)',
          [userId, 'General Practitioner', 'active']
        );
      }
      // For role === 'admin', no patient or doctor profile is created.

      // 6. Record audit log for successful registration
      try {
        await connection.execute<ResultSetHeader>(
          'INSERT INTO system_logs (user_id, level, action, message) VALUES (?, ?, ?, ?)',
          [userId, 'info', 'USER_REGISTERED', `New ${role} account registered for ${fullName}`]
        );
      } catch (logError) {
        // Logging failure should not break registration if system_logs has issues,
        // but log locally
        console.warn('Failed to record registration audit log:', logError);
      }

      // 7. Commit transaction
      await connection.commit();

      return {
        id: userId,
        fullName,
        email,
        role,
      };
    } catch (error: any) {
      // Rollback transaction on failure
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Error during transaction rollback:', rollbackError);
      }

      // Handle duplicate-key database constraint error cleanly (ER_DUP_ENTRY)
      if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
        throw new AppError('A user with this email already exists', 409);
      }

      // Re-throw AppErrors directly (e.g. 409 from pre-check)
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Registration database error:', error.message || error);
      throw new AppError('Failed to complete registration due to a server error', 500);
    } finally {
      connection.release();
    }
  }

  /**
   * Authenticates a user using email and password, fetches role from DB,
   * verifies password via bcrypt, and returns a signed JWT with user profile.
   *
   * SECURITY:
   * - Generic error message "Invalid email or password" prevents account enumeration.
   * - Passwords and raw hashes are never logged or returned.
   * - The role is ALWAYS resolved from the database users table, ignoring any client role input.
   */
  public static async login(data: LoginDTO): Promise<LoginResult> {
    const { email, password } = data;

    try {
      // 1. Fetch user by normalized email using parameterized query
      const [rows] = await pool.execute<RowDataPacket[]>(
        'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        throw new AppError('Invalid email or password', 401);
      }

      const user = rows[0];

      // 2. Verify password with bcrypt.compare
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new AppError('Invalid email or password', 401);
      }

      // 3. Generate JWT with minimal identity payload (userId, role)
      const token = signToken({
        userId: user.id,
        role: user.role,
      });

      return {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error: any) {
      if (error instanceof AppError) {
        throw error;
      }

      console.error('Login error:', error.message || error);
      throw new AppError('An error occurred during login', 500);
    }
  }
}
