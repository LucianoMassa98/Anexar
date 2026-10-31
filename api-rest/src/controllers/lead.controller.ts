import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';

const leadSchema = z.object({
  fullName: z.string().min(2, 'El nombre es obligatorio'),
  company: z.string().min(2, 'La empresa es obligatoria'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  currentErp: z.string().optional(),
  dataVolume: z.string().optional(),
  needType: z
    .enum(['CENTRALIZATION', 'AI_ANALYTICS', 'FINANCIAL_AUDIT', 'ERP_MIGRATION', 'GENERAL_CONSULTING'])
    .default('GENERAL_CONSULTING'),
  message: z.string().optional(),
});

export class LeadController {
  /**
   * Registers a new consulting lead from the Landing Page
   * POST /api/leads
   */
  public static async captureLead(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = leadSchema.parse(req.body);

      const lead = await prisma.lead.create({
        data: {
          fullName: data.fullName,
          company: data.company,
          email: data.email,
          phone: data.phone,
          currentErp: data.currentErp,
          dataVolume: data.dataVolume,
          needType: data.needType,
          message: data.message,
          status: 'NEW',
        },
      });

      res.status(201).json({
        success: true,
        message: '¡Gracias por contactar a ANEXAR Consultoría! Un especialista senior se comunicará a la brevedad.',
        leadId: lead.id,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists leads for internal consultant dashboard
   * GET /api/leads
   */
  public static async listLeads(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const leads = await prisma.lead.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json({ success: true, count: leads.length, data: leads });
    } catch (error) {
      next(error);
    }
  }
}
