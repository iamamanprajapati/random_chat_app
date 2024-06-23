const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  roomId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
