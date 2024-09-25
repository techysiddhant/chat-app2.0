const  { PrismaClient } = require('@prisma/client');

const db = new PrismaClient({
  log: ["error"],
});

module.exports = db;