import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from '../config/env';
import { prisma } from '../services/prisma.service';
import { GoogleCalendarService } from '../services/googleCalendar.service';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email corporativo inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export class AuthController {
  /**
   * User Registration (Sign Up)
   * POST /api/auth/register
   */
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, company } = registerSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (existingUser) {
        res.status(400).json({
          success: false,
          error: 'Este correo electrónico ya está registrado. Por favor inicie sesión.',
        });
        return;
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          company: company || null,
          role: 'USER',
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Usuario registrado con éxito',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0]?.message || 'Datos inválidos' });
        return;
      }
      next(error);
    }
  }

  /**
   * User Login (Sign In)
   * POST /api/auth/login
   */
  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const normalizedEmail = email.toLowerCase().trim();

      const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
      });

      if (!user || !user.passwordHash) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas. Verifique su email y contraseña.',
        });
        return;
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Credenciales inválidas. Verifique su email y contraseña.',
        });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(200).json({
        success: true,
        message: 'Sesión iniciada con éxito',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          company: user.company,
          role: user.role,
        },
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: error.errors[0]?.message || 'Datos inválidos' });
        return;
      }
      next(error);
    }
  }

  /**
   * Generates Google OAuth2 consent URL for Calendar access
   * GET /api/auth/google/url
   */
  public static getGoogleAuthUrl(req: Request, res: Response): void {
    const userId = (req.query.userId as string) || 'default_user';
    const authUrl = GoogleCalendarService.getAuthorizationUrl(userId);
    res.status(200).json({ success: true, url: authUrl });
  }

  /**
   * Handles Google OAuth2 redirect callback
   * GET /api/auth/google/callback
   */
  public static async handleGoogleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string; // userId

      if (!code) {
        res.status(400).send('Código de autorización faltante de Google.');
        return;
      }

      const { refreshToken, email } = await GoogleCalendarService.getTokensFromCode(code);

      if (state && refreshToken) {
        await prisma.user.updateMany({
          where: { id: state },
          data: {
            googleRefreshToken: refreshToken,
            googleCalendarEmail: email,
          },
        });
      }

      // Redirect back to frontend
      res.redirect(`${env.CORS_ORIGIN}/?google_calendar_linked=true`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Issues a development / guest token for instant self-hosted usage
   * POST /api/auth/guest-token
   */
  public static async issueGuestToken(_req: Request, res: Response): Promise<void> {
    const user = await prisma.user.upsert({
      where: { email: 'developer@anexar.com.ar' },
      update: {},
      create: {
        email: 'developer@anexar.com.ar',
        name: 'ANEXAR Open Source Explorer',
        role: 'USER',
      },
    });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }
}
