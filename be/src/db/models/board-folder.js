const Sequelize = require('sequelize');
const db = require('../index');

const User = require('./user');
const Workspace = require('./workspace');

const BoardFolder = db.define('boardFolder', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  order: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  idWorkspace: {
    type: Sequelize.BIGINT,
    allowNull: false
  },
  idParent: {
    type: Sequelize.BIGINT
  },
  boardType: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  createdBy: Sequelize.BIGINT,

  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, { timestamps: true });


BoardFolder.belongsTo(User, {foreignKey: 'createdBy', targetKey: 'id'});
BoardFolder.belongsTo(Workspace, {foreignKey: 'idWorkspace', targetKey: 'id'});
BoardFolder.belongsTo(BoardFolder, {foreignKey: 'idParent', targetKey: 'id'});

module.exports = BoardFolder;
