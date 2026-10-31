import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { prisma } from '../services/prisma.service';
import { GoogleCalendarService } from '../services/googleCalendar.service';

export class AuthController {
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
