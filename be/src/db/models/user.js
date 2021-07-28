const Sequelize = require('sequelize');
const db = require('../index');

const Client = require('./client');

const User = db.define('user', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: true
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  password: {
    type: Sequelize.STRING
  },
  confirmKey: {
    type: Sequelize.STRING
  },
  idClient: {
    type: Sequelize.BIGINT
  },
  lastWorkspaceId: {
    type: Sequelize.BIGINT
  },
  lastLogin: Sequelize.DATE,
  theme: Sequelize.STRING,
  imageUrl: Sequelize.STRING,
  isAdmin: Sequelize.BOOLEAN,
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

User.belongsTo(Client, {foreignKey: 'idClient', targetKey: 'id'});

module.exports = User;
