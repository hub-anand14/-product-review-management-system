import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
export const getProducts = async (req, res, next) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    return res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Fetch single product by ID
 * @route   GET /api/products/:id
 * @access  Public
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a product
 * @route   POST /api/products
 * @access  Private/Admin
 */
export const createProduct = async (req, res, next) => {
  try {
    const { name, category, price, description } = req.body;

    if (!name || !category || price === undefined || !description) {
      return res.status(400).json({ message: 'Please provide name, category, price, and description' });
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number' });
    }

    const trimmedName = String(name).trim();
    const trimmedCategory = String(category).trim();
    const trimmedDescription = String(description).trim();

    if (trimmedName.length < 2) {
      return res.status(400).json({ message: 'Product name must be at least 2 characters long' });
    }

    if (trimmedCategory.length < 2) {
      return res.status(400).json({ message: 'Category must be at least 2 characters long' });
    }

    if (trimmedDescription.length < 5) {
      return res.status(400).json({ message: 'Description must be at least 5 characters long' });
    }

    const product = await Product.create({
      name: trimmedName,
      category: trimmedCategory,
      price: numericPrice,
      description: trimmedDescription,
      averageRating: 0,
      numReviews: 0,
    });

    return res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private/Admin
 */
export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, category, price, description } = req.body;

    if (name !== undefined) {
      const trimmedName = String(name).trim();
      if (trimmedName.length < 2) {
        return res.status(400).json({ message: 'Product name must be at least 2 characters long' });
      }
      product.name = trimmedName;
    }

    if (category !== undefined) {
      const trimmedCategory = String(category).trim();
      if (trimmedCategory.length < 2) {
        return res.status(400).json({ message: 'Category must be at least 2 characters long' });
      }
      product.category = trimmedCategory;
    }

    if (price !== undefined) {
      const numericPrice = Number(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return res.status(400).json({ message: 'Price must be a valid non-negative number' });
      }
      product.price = numericPrice;
    }

    if (description !== undefined) {
      const trimmedDescription = String(description).trim();
      if (trimmedDescription.length < 5) {
        return res.status(400).json({ message: 'Description must be at least 5 characters long' });
      }
      product.description = trimmedDescription;
    }

    const updatedProduct = await product.save();
    return res.status(200).json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product and all associated reviews
 * @route   DELETE /api/products/:id
 * @access  Private/Admin
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid product ID' });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Cascade delete: Remove all associated reviews for consistency
    await Review.deleteMany({ productId: product._id });
    await product.deleteOne();

    return res.status(200).json({ message: 'Product and associated reviews deleted successfully' });
  } catch (error) {
    next(error);
  }
};
