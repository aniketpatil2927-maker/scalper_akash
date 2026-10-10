import { Request, Response } from 'express';
import { CrmLead } from '../models/index';

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stage, search } = req.query;
    const where: any = {};

    if (stage && stage !== 'ALL') {
      where.stage = stage;
    }

    const leads = await CrmLead.findAll({
      where,
      order: [['id', 'DESC']],
    });

    res.json(leads);
  } catch (error: any) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, stage, source, notes, leadValue } = req.body;

    const lead = await CrmLead.create({
      name,
      email,
      phone: phone || null,
      stage: stage || 'NEW',
      source: source || 'WEBSITE',
      notes: notes || null,
      leadValue: leadValue || 0.00,
      lastContactDate: new Date(),
    });

    res.status(201).json(lead);
  } catch (error: any) {
    console.error('Error creating lead:', error);
    res.status(500).json({ error: error.message || 'Failed to create lead' });
  }
};

export const updateLeadStage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    const lead = await CrmLead.findByPk(id);
    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    await lead.update({
      stage,
      lastContactDate: new Date(),
    });

    res.json(lead);
  } catch (error: any) {
    console.error('Error updating lead stage:', error);
    res.status(500).json({ error: 'Failed to update lead stage' });
  }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await CrmLead.findByPk(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    await lead.update(req.body);
    res.json(lead);
  } catch (error: any) {
    console.error('Error updating lead:', error);
    res.status(500).json({ error: 'Failed to update lead' });
  }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await CrmLead.findByPk(id);

    if (!lead) {
      res.status(404).json({ error: 'Lead not found' });
      return;
    }

    await lead.destroy();
    res.json({ message: 'Lead deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting lead:', error);
    res.status(500).json({ error: 'Failed to delete lead' });
  }
};

export const getCrmStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const leads = await CrmLead.findAll();

    const totalLeads = leads.length;
    const stageCounts: Record<string, number> = {
      NEW: 0,
      CONTACTED: 0,
      INTERESTED: 0,
      FREE_USER: 0,
      TRIAL: 0,
      PAID: 0,
      PREMIUM: 0,
      VIP: 0,
      RENEWAL: 0,
    };

    let totalPipelineValue = 0;
    let convertedCount = 0;

    leads.forEach(l => {
      if (stageCounts[l.stage] !== undefined) {
        stageCounts[l.stage]++;
      }
      totalPipelineValue += Number(l.leadValue || 0);
      if (['PAID', 'PREMIUM', 'VIP'].includes(l.stage)) {
        convertedCount++;
      }
    });

    const conversionRate = totalLeads > 0 ? (convertedCount / totalLeads) * 100 : 0;

    res.json({
      totalLeads,
      totalPipelineValue: Number(totalPipelineValue.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(1)),
      stageCounts,
    });
  } catch (error: any) {
    console.error('Error fetching CRM stats:', error);
    res.status(500).json({ error: 'Failed to fetch CRM stats' });
  }
};
