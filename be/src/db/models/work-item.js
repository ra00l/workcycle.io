const Sequelize = require('sequelize');
const db = require('../index');

const Client = require('./client');
const Board = require('./board');
const User = require('./user');
const Nest = require('./nest');

const WorkItem = db.define('workItem', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  publicId: Sequelize.BIGINT,
  title: Sequelize.STRING,
  description: Sequelize.TEXT,
  order: Sequelize.INTEGER,
  status: Sequelize.INTEGER,
  idClient: Sequelize.BIGINT,
  idBoard: Sequelize.BIGINT,
  idParent: {
    type: Sequelize.BIGINT,
    allowNull: true
  },
  data: Sequelize.TEXT,
  externalUrl: Sequelize.STRING,
  idNest: Sequelize.BIGINT,
  createdBy: Sequelize.BIGINT,
  lastSyncDate: Sequelize.DATE,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});


WorkItem.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});
WorkItem.belongsTo(Board, {foreignKey: 'idBoard', targetKey: 'id'});
WorkItem.belongsTo(Client, {foreignKey: 'idClient', targetKey: 'id'});
WorkItem.belongsTo(Nest, {foreignKey: 'idNest', targetKey: 'id'});

module.exports = WorkItem;
