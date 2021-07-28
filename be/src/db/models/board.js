const Sequelize = require('sequelize');
const db = require('../index');

const User = require('./user');
const Workspace = require('./workspace');
const BoardTemplate = require('./board-template');
const BoardFolder = require('./board-folder');

const Board = db.define('board', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  urlName: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.TEXT
  },
  idTemplate: {
    type: Sequelize.BIGINT
  },
  order: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  boardType: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  boardAccessType: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  dataStructure: {
    type: Sequelize.TEXT
  },
  idWorkspace: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  idDefaultNest: {
    type: Sequelize.BIGINT
  },
  idFolder: {
    type: Sequelize.BIGINT
  },
  doneField: Sequelize.STRING,
  doneValue: Sequelize.STRING,
  dueDate: Sequelize.DATE,

  createdBy: Sequelize.BIGINT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, { timestamps: true });


Board.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});
Board.belongsTo(Workspace, {foreignKey: 'idWorkspace', targetKey: 'id'});
Board.belongsTo(BoardTemplate, {foreignKey: 'idTemplate', targetKey: 'id'});
Board.belongsTo(BoardFolder, {foreignKey: 'idFolder', targetKey: 'id'});

module.exports = Board;
