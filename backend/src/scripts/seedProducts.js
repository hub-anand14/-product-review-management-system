import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

dotenv.config();

/**
 * Sample products conforming strictly to the Product model schema:
 * - name (String, required, min 2)
 * - category (String, required, min 2)
 * - price (Number, required, min 0)
 * - description (String, required, min 5)
 * - averageRating (Number, default 0)
 * - numReviews (Number, default 0)
 */
const sampleProducts = [
  {
    name: 'Wireless Noise-Canceling Headphones',
    category: 'Audio',
    price: 199.99,
    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear acoustic fidelity.',
  },
  {
    name: 'Mechanical Gaming Keyboard',
    category: 'Computers',
    price: 89.99,
    description: 'Customizable RGB backlit mechanical keyboard featuring tactile mechanical switches and durable aircraft-grade aluminum casing.',
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    category: 'Furniture',
    price: 249.50,
    description: 'Breathable high-back ergonomic desk chair with multi-angle tilt lock, 3D adjustable armrests, and dynamic lumbar support.',
  },
  {
    name: 'Smart GPS Fitness Watch',
    category: 'Wearables',
    price: 129.00,
    description: 'Water-resistant fitness smartwatch with continuous heart-rate tracking, sleep cycle analysis, integrated GPS, and 7-day battery life.',
  },
];

/**
 * Safe development-only seed script.
 * Inserts sample products without deleting existing data.
 * Checks for existing products by name to prevent duplicate entries when run multiple times.
 */
const seedProducts = async () => {
  try {
    await connectDB();

    let insertedCount = 0;
    let existingCount = 0;

    for (const productData of sampleProducts) {
      const existingProduct = await Product.findOne({ name: productData.name });

      if (!existingProduct) {
        await Product.create({
          ...productData,
          averageRating: 0,
          numReviews: 0,
        });
        insertedCount++;
        console.log(`[Seed] Inserted: "${productData.name}" ($${productData.price})`);
      } else {
        existingCount++;
        console.log(`[Seed] Skipped (already exists): "${productData.name}"`);
      }
    }

    console.log(`\n[Seed Summary] Completed product seeding: ${insertedCount} inserted, ${existingCount} already present.`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed products: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();
