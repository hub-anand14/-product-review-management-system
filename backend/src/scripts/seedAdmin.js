import dotenv from 'dotenv';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

/**
 * CLI script to safely seed an initial administrator account.
 * Reads credentials from environment variables or command-line flags.
 * Usage:
 *   ADMIN_NAME="Admin" ADMIN_EMAIL="admin@example.com" ADMIN_PASSWORD="SecretPassword123" npm run seed:admin
 *   OR:
 *   npm run seed:admin -- --email=admin@example.com --password=SecretPassword123 --name=Admin
 */
const seedAdmin = async () => {
  try {
    // Parse any CLI arguments like --email=... --password=...
    const args = process.argv.slice(2);
    const parsedArgs = {};
    for (const arg of args) {
      if (arg.startsWith('--')) {
        const [key, val] = arg.slice(2).split('=');
        parsedArgs[key] = val;
      }
    }

    const name = parsedArgs.name || process.env.ADMIN_NAME || 'System Admin';
    const email = parsedArgs.email || process.env.ADMIN_EMAIL || 'admin@example.com';
    const password = parsedArgs.password || process.env.ADMIN_PASSWORD;

    if (!password) {
      console.error('[Error] Admin password must be provided via ADMIN_PASSWORD environment variable or --password flag.');
      process.exit(1);
    }

    if (password.length < 6) {
      console.error('[Error] Admin password must be at least 6 characters long.');
      process.exit(1);
    }

    await connectDB();

    const normalizedEmail = email.trim().toLowerCase();
    let adminUser = await User.findOne({ email: normalizedEmail });

    if (adminUser) {
      adminUser.name = name;
      adminUser.role = 'admin';
      adminUser.password = password; // Will be hashed by User pre-save hook
      await adminUser.save();
      console.log(`[Success] Existing user (${normalizedEmail}) updated to 'admin' role.`);
    } else {
      adminUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: 'admin',
      });
      console.log(`[Success] New admin user created successfully with email: ${normalizedEmail}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Error] Failed to seed admin user: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
