import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Product, Order, User } from '../models/index';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, search } = req.query;
    const where: any = { isActive: true };

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    const products = await Product.findAll({
      where,
      order: [['id', 'ASC']],
    });

    res.json(products);
  } catch (error: any) {
    console.error('Error fetching marketplace products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (error: any) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, type, price, discountPrice, description, features, thumbnailUrl, downloadUrl } = req.body;

    const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const product = await Product.create({
      title,
      slug: finalSlug,
      type: type || 'EBOOK',
      price,
      discountPrice: discountPrice || null,
      description,
      features: Array.isArray(features) ? features : [],
      thumbnailUrl: thumbnailUrl || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=400',
      downloadUrl: downloadUrl || null,
      rating: 5.0,
      salesCount: 0,
      isActive: true,
    });

    res.status(201).json(product);
  } catch (error: any) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: error.message || 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await product.update(req.body);
    res.json(product);
  } catch (error: any) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);

    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    await product.destroy();
    res.json({ message: 'Product deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
};

export const checkoutProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { productId } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    const price = product.discountPrice ? Number(product.discountPrice) : Number(product.price);

    const order = await Order.create({
      userId,
      orderType: 'COURSE', // Reusing order structure
      itemId: product.id,
      amount: price,
      discountAmount: 0,
      finalAmount: price,
      status: 'PAID',
    });

    await product.increment('salesCount', { by: 1 });

    res.status(201).json({
      message: 'Product purchased successfully',
      order,
      downloadUrl: product.downloadUrl || 'https://scalperakash.com/downloads/secure-resource.pdf',
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message || 'Checkout failed' });
  }
};
