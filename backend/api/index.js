'use strict';

const app = require('../src/app');
const db = require('../src/config/db');
const mongoose = require('mongoose');

module.exports = async (req, res) => {
  // Ensure MongoDB is connected before handling serverless request
  if (mongoose.connection.readyState !== 1) {
    try {
      await db.connect();
    } catch (err) {
      console.error('[Vercel Serverless] DB connection error:', err.message);
    }
  }
  return app(req, res);
};

