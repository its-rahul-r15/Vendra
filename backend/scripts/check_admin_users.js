'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../src/config/env');
const User = require('../src/modules/users/user.model');
const bcrypt = require('bcryptjs');

async function run() {
  await mongoose.connect(env.db.uri);
  const admins = await User.find({ role: { $in: ['admin', 'super_admin'] } }).select('+passwordHash');
  console.log(`Found ${admins.length} admin(s):`);
  for (const a of admins) {
    const isPassMatch = a.passwordHash ? await bcrypt.compare('Password@123', a.passwordHash) : false;
    console.log(`Email: "${a.email}", Phone: "${a.phone}", Role: "${a.role}", Active: ${a.isActive}, 'Password@123' valid: ${isPassMatch}`);
  }
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
