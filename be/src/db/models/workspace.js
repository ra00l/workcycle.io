const Sequelize = require('sequelize');
const db = require('../index');

const Client = require('./client');

const Workspace = db.define('workspace', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  idClient: {
    type: Sequelize.BIGINT
  },
  name: {
    type: Sequelize.STRING
  },
  description: Sequelize.TEXT,
  status: Sequelize.INTEGER,
  createdBy: Sequelize.BIGINT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE,
  deletedAt: Sequelize.DATE
}, {timestamps: true});

Workspace.belongsTo(Client, {foreignKey: 'idClient', targetKey: 'id'});

module.exports = Workspace;
