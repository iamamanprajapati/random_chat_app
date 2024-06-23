const { sequelize, connectDB } = require('../config/db');
const User = require('./userModel');

const syncDB = async () => {
  await connectDB();
  await sequelize.sync({ force: true });
  console.log('All models were synchronized successfully.');
};

module.exports = { User, syncDB };
