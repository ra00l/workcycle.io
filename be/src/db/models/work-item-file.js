const Sequelize = require('sequelize');
const db = require('../index');

const WorkItem = require('./work-item');
const User = require('./user');

const WorkItemFile = db.define('workItemFile', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  idWorkItem: Sequelize.BIGINT,
  name: Sequelize.STRING,
  url: Sequelize.STRING,
  mimeType: Sequelize.STRING,
  description: Sequelize.TEXT,
  status: Sequelize.INTEGER,
  createdBy: Sequelize.BIGINT,
  idComment: Sequelize.BIGINT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});


WorkItemFile.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});
WorkItemFile.belongsTo(WorkItem, {foreignKey: 'idWorkItem', targetKey: 'id'});

module.exports = WorkItemFile;
