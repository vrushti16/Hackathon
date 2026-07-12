const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');

const usersToSeed = [
  {
    name: "Nandana Suresh",
    email: "nandanasn77@gmail.com",
    role: "Admin"
  },
  {
    name: "Tithi Mistry",
    email: "tithimistry6906@gmail.com",
    role: "Fleet Manager"
  },
  {
    name: "Vrushti",
    email: "vrushti1020@gmail.com",
    role: "Safety Officer"
  },
  {
    name: "Ruchi Patel",
    email: "patelruchi2835@gmail.com",
    role: "Financial Analyst"
  },
  {
    name: "Nandana Nangakeyil",
    email: "nandana.nangakeyil@gmail.com",
    role: "Driver"
  }
];

const seedUsers = async () => {
  if (process.env.ENABLE_USER_SEEDING !== 'true') {
    console.log('User seeding is disabled. Set ENABLE_USER_SEEDING=true in .env to enable.');
    process.exit(0);
  }

  const password = process.env.SEED_USER_PASSWORD;
  if (!password) {
    console.error('SEED_USER_PASSWORD environment variable is missing.');
    process.exit(1);
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('MONGO_URI environment variable is missing.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for user seeding.');

    for (const u of usersToSeed) {
      const emailLower = u.email.trim().toLowerCase();
      const existingUser = await User.findOne({ email: emailLower });

      if (existingUser) {
        console.log(`User ${emailLower} already exists. Updating name, role, and status.`);
        existingUser.name = u.name;
        existingUser.role = u.role;
        existingUser.isActive = true;
        await existingUser.save();
      } else {
        console.log(`Creating user ${emailLower} with role ${u.role}.`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.create({
          name: u.name,
          email: emailLower,
          password: hashedPassword,
          role: u.role,
          isActive: true
        });
      }
    }

    console.log('User seeding completed successfully.');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();
