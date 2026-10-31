import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';

const requestSchema = z.object({
  title: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'Por favor describa brevemente su requerimiento'),
  type: z.enum(['CONSULTORIA_CONTABLE', 'CENTRALIZACION_ERPS', 'TEXT_TO_SQL_IA', 'SOPORTE_TECNICO']).default('CONSULTORIA_CONTABLE'),
  currentErp: z.string().optional(),
  userId: z.string().optional(),
});

export class ServiceRequestController {
  /**
   * Creates a consulting or support request from a registered user inside their dashboard
   * POST /api/service-requests
   */
  public static async createRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = requestSchema.parse(req.body);
      const authenticatedUserId = (req as any).user?.id || data.userId;

      let targetUserId = authenticatedUserId;
      if (!targetUserId) {
        // Fallback to primary admin/default user
        const defaultUser = await prisma.user.findFirst();
        targetUserId = defaultUser?.id;
      }

      if (!targetUserId) {
        res.status(401).json({
          success: false,
          error: 'Debe iniciar sesión para solicitar servicios de consultoría o soporte.',
        });
        return;
      }

      const newRequest = await prisma.serviceRequest.create({
        data: {
          userId: targetUserId,
          title: data.title,
          description: data.description,
          type: data.type,
          currentErp: data.currentErp || null,
          status: 'PENDING',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Su solicitud ha sido enviada con éxito. Un especialista de ANEXAR se comunicará a la brevedad.',
        data: newRequest,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists service requests for the user
   * GET /api/service-requests
   */
  public static async listRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string);
      const where: any = {};
      if (userId) where.userId = userId;

      const requests = await prisma.serviceRequest.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true, company: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json({ success: true, count: requests.length, data: requests });
    } catch (error) {
      next(error);
    }
  }
}

