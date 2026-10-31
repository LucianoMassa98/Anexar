import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../services/prisma.service';

const createStrategySchema = z.object({
  title: z.string().min(3),
  description: z.string(),
  promptTemplate: z.string().min(3),
  generatedSql: z.string().min(5),
  chartType: z.enum(['BAR', 'LINE', 'PIE', 'AREA', 'TABLE', 'KPI_CARD']).default('BAR'),
  chartConfig: z.record(z.any()).optional(),
  parameters: z.record(z.any()).optional(),
  category: z.enum(['FINANCE', 'CONTABILITY', 'OPERATIONS', 'SALES', 'INVENTORY', 'TAX']).default('FINANCE'),
  visibility: z.enum(['PRIVATE', 'PUBLIC']).default('PRIVATE'),
  isPremium: z.boolean().default(false),
  isTemplate: z.boolean().default(false),
});

const ratingSchema = z.object({
  score: z.number().int().min(1).max(5),
  review: z.string().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1),
  parentId: z.string().optional(),
});

export class StrategyController {
  /**
   * Lists public marketplace strategies or user's private strategies
   */
  public static async listStrategies(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { category, isPremium, isTemplate, search, visibility } = req.query;
      const userId = (req as any).user?.id;

      const where: any = {};

      if (visibility === 'PUBLIC' || !userId) {
        where.visibility = 'PUBLIC';
      } else if (visibility === 'PRIVATE' && userId) {
        where.authorId = userId;
      } else if (userId) {
        // Can view public ones OR own private ones
        where.OR = [{ visibility: 'PUBLIC' }, { authorId: userId }];
      }

      if (category) where.category = category;
      if (isPremium !== undefined) where.isPremium = isPremium === 'true';
      if (isTemplate !== undefined) where.isTemplate = isTemplate === 'true';
      if (search) {
        where.OR = [
          { title: { contains: String(search), mode: 'insensitive' } },
          { description: { contains: String(search), mode: 'insensitive' } },
        ];
      }

      const strategies = await prisma.strategy.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, company: true, avatarUrl: true } },
          ratings: { select: { score: true } },
          _count: { select: { comments: true, ratings: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate average rating
      const formatted = strategies.map((s) => {
        const avgRating =
          s.ratings.length > 0
            ? Number((s.ratings.reduce((acc, r) => acc + r.score, 0) / s.ratings.length).toFixed(1))
            : 0;

        return {
          ...s,
          averageRating: avgRating,
          ratingsCount: s._count.ratings,
          commentsCount: s._count.comments,
        };
      });

      res.status(200).json({ success: true, data: formatted });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves predefined enterprise KPI templates curated by ANEXAR Consultoría
   */
  public static async getPredefinedTemplates(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const templates = await prisma.strategy.findMany({
        where: { isTemplate: true },
        include: {
          author: { select: { name: true, company: true } },
          ratings: true,
        },
      });

      res.status(200).json({ success: true, count: templates.length, data: templates });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves single strategy by ID with nested comments and reviews
   */
  public static async getStrategyById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const strategy = await prisma.strategy.findUnique({
        where: { id },
        include: {
          author: { select: { id: true, name: true, company: true, avatarUrl: true } },
          ratings: {
            include: { user: { select: { id: true, name: true } } },
          },
          comments: {
            where: { parentId: null },
            include: {
              user: { select: { id: true, name: true, avatarUrl: true } },
              replies: {
                include: { user: { select: { id: true, name: true } } },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!strategy) {
        res.status(404).json({ success: false, error: 'Estrategia no encontrada.' });
        return;
      }

      // Increment view counter
      await prisma.strategy.update({
        where: { id },
        data: { viewsCount: { increment: 1 } },
      });

      res.status(200).json({ success: true, data: strategy });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Creates a new strategy
   */
  public static async createStrategy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = createStrategySchema.parse(req.body);
      const userId = (req as any).user?.id;

      // Fallback user if not authenticated in self-hosted mode
      let authorId = userId;
      if (!authorId) {
        const defaultUser = await prisma.user.upsert({
          where: { email: 'admin@anexar.com.ar' },
          update: {},
          create: {
            email: 'admin@anexar.com.ar',
            name: 'ANEXAR Lead Architect',
            role: 'ADMIN',
            company: 'ANEXAR Consultoría Contable & Tecnológica',
          },
        });
        authorId = defaultUser.id;
      }

      const slug = `${parsed.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')}-${Date.now()}`;

      const strategy = await prisma.strategy.create({
        data: {
          ...parsed,
          slug,
          authorId,
        },
      });

      res.status(201).json({ success: true, data: strategy });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Rates a public strategy (1 to 5 stars)
   */
  public static async rateStrategy(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { score, review } = ratingSchema.parse(req.body);
      const userId = (req as any).user?.id;

      let voterId = userId;
      if (!voterId) {
        const guest = await prisma.user.upsert({
          where: { email: 'comunidad@anexar.com.ar' },
          update: {},
          create: {
            email: 'comunidad@anexar.com.ar',
            name: 'Miembro de la Comunidad',
            role: 'USER',
          },
        });
        voterId = guest.id;
      }

      const rating = await prisma.strategyRating.upsert({
        where: {
          strategyId_userId: {
            strategyId: id,
            userId: voterId,
          },
        },
        update: { score, review },
        create: {
          strategyId: id,
          userId: voterId,
          score,
          review,
        },
      });

      res.status(200).json({ success: true, data: rating });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Adds a comment or nested reply to a strategy
   */
  public static async addComment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { content, parentId } = commentSchema.parse(req.body);
      const userId = (req as any).user?.id;

      let commentAuthorId = userId;
      if (!commentAuthorId) {
        const guest = await prisma.user.upsert({
          where: { email: 'comunidad@anexar.com.ar' },
          update: {},
          create: {
            email: 'comunidad@anexar.com.ar',
            name: 'Miembro de la Comunidad',
            role: 'USER',
          },
        });
        commentAuthorId = guest.id;
      }

      const comment = await prisma.strategyComment.create({
        data: {
          strategyId: id,
          userId: commentAuthorId,
          content,
          parentId,
        },
        include: {
          user: { select: { id: true, name: true, avatarUrl: true } },
        },
      });

      res.status(201).json({ success: true, data: comment });
    } catch (error) {
      next(error);
    }
  }
}
