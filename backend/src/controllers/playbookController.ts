import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Playbook } from '../models/index';

export const getPlaybooks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, tier, search } = req.query;
    const where: any = { status: 'PUBLISHED' };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (tier && tier !== 'ALL') {
      where.tierRequired = tier;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const playbooks = await Playbook.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.json(playbooks);
  } catch (error: any) {
    console.error('Error fetching playbooks:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
};

export const getPlaybookBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const playbook = await Playbook.findOne({ where: { slug } });

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    // Increment views
    await playbook.increment('viewsCount', { by: 1 });

    res.json(playbook);
  } catch (error: any) {
    console.error('Error fetching playbook details:', error);
    res.status(500).json({ error: 'Failed to fetch playbook' });
  }
};

export const getAllPlaybooksAdmin = async (req: Request, res: Response): Promise<void> => {
  try {
    const playbooks = await Playbook.findAll({
      order: [['id', 'DESC']],
    });
    res.json(playbooks);
  } catch (error: any) {
    console.error('Error fetching admin playbooks:', error);
    res.status(500).json({ error: 'Failed to fetch playbooks' });
  }
};

export const createPlaybook = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      slug,
      category,
      description,
      marketConditions,
      setupRules,
      entryRules,
      stopLossRules,
      targetRules,
      riskRewardRatio,
      checklist,
      chartUrl,
      pdfUrl,
      videoUrl,
      tierRequired,
      status,
    } = req.body;

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const playbook = await Playbook.create({
      title,
      slug: finalSlug,
      category: category || 'SCALPING',
      description,
      marketConditions,
      setupRules,
      entryRules,
      stopLossRules,
      targetRules,
      riskRewardRatio: riskRewardRatio || '1:2',
      checklist: Array.isArray(checklist) ? checklist : [],
      chartUrl: chartUrl || null,
      pdfUrl: pdfUrl || null,
      videoUrl: videoUrl || null,
      tierRequired: tierRequired || 'BASIC',
      status: status || 'PUBLISHED',
      viewsCount: 0,
      likesCount: 0,
    });

    res.status(201).json(playbook);
  } catch (error: any) {
    console.error('Error creating playbook:', error);
    res.status(500).json({ error: error.message || 'Failed to create playbook' });
  }
};

export const updatePlaybook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const playbook = await Playbook.findByPk(id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    await playbook.update(req.body);
    res.json(playbook);
  } catch (error: any) {
    console.error('Error updating playbook:', error);
    res.status(500).json({ error: error.message || 'Failed to update playbook' });
  }
};

export const deletePlaybook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const playbook = await Playbook.findByPk(id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    await playbook.destroy();
    res.json({ message: 'Playbook deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting playbook:', error);
    res.status(500).json({ error: 'Failed to delete playbook' });
  }
};

export const likePlaybook = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const playbook = await Playbook.findByPk(id);

    if (!playbook) {
      res.status(404).json({ error: 'Playbook not found' });
      return;
    }

    await playbook.increment('likesCount', { by: 1 });
    res.json({ likesCount: playbook.likesCount + 1 });
  } catch (error: any) {
    console.error('Error liking playbook:', error);
    res.status(500).json({ error: 'Failed to like playbook' });
  }
};
