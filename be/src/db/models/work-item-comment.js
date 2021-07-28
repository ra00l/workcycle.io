const Sequelize = require('sequelize');
const db = require('../index');

const User = require('./user');
const WorkItem = require('./work-item');

const WorkItemComment = db.define('workItemComment', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  idWorkItem: Sequelize.BIGINT,
  comment: Sequelize.TEXT,
  status: Sequelize.INTEGER,
  createdBy: Sequelize.BIGINT,

  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});


WorkItemComment.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});
WorkItemComment.belongsTo(WorkItem, {foreignKey: 'idWorkItem', targetKey: 'id'});

module.exports = WorkItemComment;
