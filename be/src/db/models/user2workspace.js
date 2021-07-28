const Sequelize = require('sequelize');
const db = require('../index');

const Workspace = require('./workspace');
const User = require('./user');

const User2Workspace = db.define('user2workspace', {
  idUser: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  idWorkspace: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  role: {
    type: Sequelize.STRING
  },

  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

User2Workspace.belongsTo(User, {foreignKey: 'idUser', targetKey: 'id'});
User2Workspace.belongsTo(Workspace, {foreignKey: 'idWorkspace', targetKey: 'id'});

module.exports = User2Workspace;
