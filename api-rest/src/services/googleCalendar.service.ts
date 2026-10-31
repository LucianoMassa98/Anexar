import { google } from 'googleapis';
import { env } from '../config/env';

/**
 * GoogleCalendarService
 * Manages Google OAuth2 authorization lifecycle and schedules recurring strategy alert check-ins
 * directly onto the client's Google Calendar using RFC 5545 RRULEs.
 */
export class GoogleCalendarService {
  private static getOAuth2Client() {
    return new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );
  }

  /**
   * Generates Google OAuth consent screen URL.
   */
  public static getAuthorizationUrl(userId: string): string {
    const oauth2Client = this.getOAuth2Client();

    const scopes = [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: scopes,
      state: userId,
    });
  }

  /**
   * Exchanges authorization code for access and refresh tokens.
   */
  public static async getTokensFromCode(code: string): Promise<{
    refreshToken: string | null;
    accessToken: string | null;
    email?: string;
  }> {
    const oauth2Client = this.getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let email: string | undefined;
    try {
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      email = userInfo.data.email || undefined;
    } catch {
      // email retrieval optional
    }

    return {
      refreshToken: tokens.refresh_token || null,
      accessToken: tokens.access_token || null,
      email,
    };
  }

  /**
   * Schedules a recurring event on the user's Google Calendar.
   */
  public static async createRecurringAlertEvent(params: {
    refreshToken: string;
    alertName: string;
    strategyTitle: string;
    frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    metricName: string;
    operator: string;
    thresholdValue: number;
    dashboardUrl?: string;
  }): Promise<{ eventId: string; htmlLink: string; rrule: string }> {
    // If credentials are dummy/empty (e.g. initial dev/demo), return mock event with explicit notice
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
      console.warn('[GoogleCalendarService] Missing Google OAuth credentials. Returning simulated Calendar event.');
      const rrule = this.buildRRule(params.frequency);
      return {
        eventId: `simulated_gcal_${Date.now()}`,
        htmlLink: 'https://calendar.google.com/calendar/u/0/r',
        rrule,
      };
    }

    const oauth2Client = this.getOAuth2Client();
    oauth2Client.setCredentials({ refresh_token: params.refreshToken });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const rrule = this.buildRRule(params.frequency);

    const now = new Date();
    // Schedule first occurrence tomorrow at 09:00 AM
    const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 9, 0, 0);
    const endDateTime = new Date(startDateTime.getTime() + 30 * 60 * 1000); // 30 min duration

    const description = `
📊 ANEXAR — Monitoreo de Alerta de Datos
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Estrategia: ${params.strategyTitle}
Alerta: ${params.alertName}
Condición Umbral: ${params.metricName} ${params.operator} ${params.thresholdValue}
Frecuencia de Evaluación: ${params.frequency}

🔗 Panel de Control: ${params.dashboardUrl || 'http://localhost:3000'}

Generado automáticamente por Anexar (Consultoría Contable & Tecnológica).
    `.trim();

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🔔 [ANEXAR KPI] ${params.alertName}`,
        description,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: 'America/Argentina/Buenos_Aires',
        },
        recurrence: [`RRULE:${rrule}`],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'popup', minutes: 10 },
            { method: 'email', minutes: 30 },
          ],
        },
      },
    });

    return {
      eventId: response.data.id || `gcal_${Date.now()}`,
      htmlLink: response.data.htmlLink || 'https://calendar.google.com',
      rrule,
    };
  }

  private static buildRRule(frequency: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY'): string {
    switch (frequency) {
      case 'HOURLY':
        return 'FREQ=HOURLY;INTERVAL=1';
      case 'DAILY':
        return 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0';
      case 'WEEKLY':
        return 'FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=0';
      case 'MONTHLY':
        return 'FREQ=MONTHLY;BYMONTHDAY=1;BYHOUR=9;BYMINUTE=0';
      default:
        return 'FREQ=DAILY;BYHOUR=9;BYMINUTE=0';
    }
  }
}
