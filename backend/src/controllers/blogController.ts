import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { BlogPost, CourseCertificate, Course, User } from '../models/index';

export const getBlogPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search } = req.query;
    const where: any = { status: 'PUBLISHED' };

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { summary: { [Op.like]: `%${search}%` } },
      ];
    }

    const posts = await BlogPost.findAll({
      where,
      order: [['publishedAt', 'DESC']],
    });

    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
};

export const getBlogPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ where: { slug } });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error: any) {
    console.error('Error fetching blog post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, category, summary, content, author, thumbnailUrl, tags, readTimeMins, status } = req.body;

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const post = await BlogPost.create({
      title,
      slug: finalSlug,
      category: category || 'Trading Education',
      summary,
      content,
      author: author || 'Scalper Akash',
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&q=80&w=800',
      tags: Array.isArray(tags) ? tags : ['Trading', 'Scalping'],
      readTimeMins: readTimeMins || 5,
      status: status || 'PUBLISHED',
      publishedAt: new Date(),
    });

    res.status(201).json(post);
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    res.status(500).json({ error: error.message || 'Failed to create blog post' });
  }
};

export const updateBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByPk(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await post.update(req.body);
    res.json(post);
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    res.status(500).json({ error: 'Failed to update blog post' });
  }
};

export const deleteBlogPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await BlogPost.findByPk(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await post.destroy();
    res.json({ message: 'Blog post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    res.status(500).json({ error: 'Failed to delete blog post' });
  }
};

// Public Certificate Verification Endpoint
export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { certificateId } = req.params;

    const certificate = await CourseCertificate.findOne({
      where: { certificateId },
      include: [
        { model: User, attributes: ['fullName'] },
        { model: Course, attributes: ['title', 'slug', 'thumbnailUrl'] },
      ],
    });

    if (!certificate) {
      res.status(404).json({ valid: false, message: 'Invalid or unregistered certificate ID' });
      return;
    }

    res.json({
      valid: true,
      certificateId: certificate.certificateId,
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      instructor: certificate.instructor,
      issueDate: certificate.issueDate,
      verificationUrl: `https://scalperakash.com/verify-certificate/${certificate.certificateId}`,
    });
  } catch (error: any) {
    console.error('Certificate verification error:', error);
    res.status(500).json({ error: 'Verification check failed' });
  }
};
