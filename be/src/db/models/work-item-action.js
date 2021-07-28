const Sequelize = require('sequelize');
const db = require('../index');

const User = require('./user');
const WorkItem = require('./work-item');
const Workspace = require('./workspace');
const BoardTemplate = require('./board-template');
const BoardFolder = require('./board-folder');

const WorkItemAction = db.define('workItemAction', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  idWorkItem: {
    type: Sequelize.BIGINT
  },
  idBoard: {
    type: Sequelize.BIGINT
  },
  updateType: {
    type: Sequelize.INTEGER
  },
  meta: {
    type: Sequelize.JSONB
  },
  createdBy: Sequelize.BIGINT,

  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, { timestamps: true });


WorkItemAction.belongsTo(WorkItem, {foreignKey: 'idWorkItem', targetKey: 'id'});
WorkItemAction.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});

module.exports = WorkItemAction;
