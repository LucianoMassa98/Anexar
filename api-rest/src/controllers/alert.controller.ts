import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';
import { GoogleCalendarService } from '../services/googleCalendar.service';

const createAlertSchema = z.object({
  name: z.string().min(2),
  strategyId: z.string().uuid(),
  conditionMetric: z.string().min(1),
  operator: z.enum(['GREATER_THAN', 'LESS_THAN', 'GREATER_EQUAL', 'LESS_EQUAL', 'EQUALS', 'NOT_EQUALS']),
  thresholdValue: z.number(),
  frequency: z.enum(['HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY']).default('DAILY'),
  syncWithGoogleCalendar: z.boolean().default(false),
});

export class AlertController {
  /**
   * Lists alerts for current user or strategy
   */
  public static async listAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { strategyId } = req.query;
      const where: any = {};
      if (strategyId) where.strategyId = String(strategyId);

      const alerts = await prisma.alert.findMany({
        where,
        include: {
          strategy: { select: { id: true, title: true } },
          calendarSync: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, count: alerts.length, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates an alert and optionally syncs it as a recurring Google Calendar event
   */
  public static async createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createAlertSchema.parse(req.body);
      const userId = (req as any).user?.id;

      let ownerId = userId;
      if (!ownerId) {
        const defaultUser = await prisma.user.upsert({
          where: { email: 'admin@anexar.com.ar' },
          update: {},
          create: {
            email: 'admin@anexar.com.ar',
            name: 'ANEXAR Lead Architect',
            role: 'ADMIN',
          },
        });
        ownerId = defaultUser.id;
      }

      // Check strategy exists
      const strategy = await prisma.strategy.findUnique({
        where: { id: parsed.strategyId },
      });

      if (!strategy) {
        res.status(404).json({ success: false, error: 'Estrategia asociada no encontrada.' });
        return;
      }

      // Create Alert
      const alert = await prisma.alert.create({
        data: {
          name: parsed.name,
          strategyId: parsed.strategyId,
          userId: ownerId,
          conditionMetric: parsed.conditionMetric,
          operator: parsed.operator,
          thresholdValue: parsed.thresholdValue,
          frequency: parsed.frequency,
        },
      });

      let calendarSyncResult = null;

      // Google Calendar Scheduling Integration
      if (parsed.syncWithGoogleCalendar) {
        const user = await prisma.user.findUnique({ where: { id: ownerId } });
        const refreshToken = user?.googleRefreshToken || 'mock_token_for_self_hosted';

        const gcalEvent = await GoogleCalendarService.createRecurringAlertEvent({
          refreshToken,
          alertName: parsed.name,
          strategyTitle: strategy.title,
          frequency: parsed.frequency,
          metricName: parsed.conditionMetric,
          operator: parsed.operator,
          thresholdValue: parsed.thresholdValue,
        });

        calendarSyncResult = await prisma.calendarSync.create({
          data: {
            alertId: alert.id,
            userId: ownerId,
            googleEventId: gcalEvent.eventId,
            eventTitle: `🔔 [ANEXAR KPI] ${parsed.name}`,
            recurrenceRule: gcalEvent.rrule,
            syncStatus: 'SYNCED',
          },
        });
      }

      res.status(201).json({
        success: true,
        data: {
          ...alert,
          calendarSync: calendarSyncResult,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

