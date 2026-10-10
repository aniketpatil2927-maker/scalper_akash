import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { CommunityPost, CommunityComment, CommunityLike, User } from '../models/index';

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { channel, search, limit = 50 } = req.query;
    const where: any = { status: 'ACTIVE' };

    if (channel && channel !== 'ALL') {
      where.channel = channel;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } },
      ];
    }

    const posts = await CommunityPost.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ['id', 'fullName', 'email'],
        },
        {
          model: CommunityComment,
          where: { status: 'ACTIVE' },
          required: false,
          include: [
            {
              model: User,
              attributes: ['id', 'fullName'],
            },
          ],
        },
      ],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit: Number(limit),
    });

    res.json(posts);
  } catch (error: any) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
};

export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'fullName', 'email'] },
        {
          model: CommunityComment,
          where: { status: 'ACTIVE' },
          required: false,
          include: [{ model: User, attributes: ['id', 'fullName'] }],
        },
      ],
    });

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    res.json(post);
  } catch (error: any) {
    console.error('Error fetching post:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { title, content, channel, chartData, imageUrl } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const post = await CommunityPost.create({
      userId,
      channel: channel || 'GENERAL',
      title,
      content,
      chartData: chartData || null,
      imageUrl: imageUrl || null,
      likesCount: 0,
      commentsCount: 0,
      isPinned: false,
      isLocked: false,
      status: 'ACTIVE',
    });

    const fullPost = await CommunityPost.findByPk(post.id, {
      include: [{ model: User, attributes: ['id', 'fullName'] }],
    });

    res.status(201).json(fullPost);
  } catch (error: any) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};

export const toggleLike = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const post = await CommunityPost.findByPk(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const existingLike = await CommunityLike.findOne({
      where: { postId: Number(id), userId },
    });

    if (existingLike) {
      await existingLike.destroy();
      await post.decrement('likesCount', { by: 1 });
      res.json({ liked: false, likesCount: Math.max(0, post.likesCount - 1) });
    } else {
      await CommunityLike.create({ postId: Number(id), userId });
      await post.increment('likesCount', { by: 1 });
      res.json({ liked: true, likesCount: post.likesCount + 1 });
    }
  } catch (error: any) {
    console.error('Error liking post:', error);
    res.status(500).json({ error: 'Failed to like post' });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { content, parentId } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Comment content is required' });
      return;
    }

    const post = await CommunityPost.findByPk(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    const comment = await CommunityComment.create({
      postId: Number(id),
      userId,
      parentId: parentId || null,
      content,
      status: 'ACTIVE',
    });

    await post.increment('commentsCount', { by: 1 });

    const fullComment = await CommunityComment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'fullName'] }],
    });

    res.status(201).json(fullComment);
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const adminModeratePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPinned, isLocked, status } = req.body;

    const post = await CommunityPost.findByPk(id);
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await post.update({
      isPinned: isPinned !== undefined ? isPinned : post.isPinned,
      isLocked: isLocked !== undefined ? isLocked : post.isLocked,
      status: status !== undefined ? status : post.status,
    });

    res.json(post);
  } catch (error: any) {
    console.error('Error moderating post:', error);
    res.status(500).json({ error: 'Failed to moderate post' });
  }
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await CommunityPost.findByPk(id);

    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }

    await post.destroy();
    res.json({ message: 'Post removed successfully' });
  } catch (error: any) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
};
