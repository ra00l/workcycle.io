const Sequelize = require('sequelize');
const db = require('../index');

const Board = require('./board');
const User = require('./user');

const User2Board = db.define('user2board', {
  idUser: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  idBoard: {
    type: Sequelize.BIGINT,
    primaryKey: true
  },
  role: {
    type: Sequelize.STRING
  },
  lastNotificationRead: Sequelize.DATE,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

User2Board.belongsTo(User, {foreignKey: 'idUser', targetKey: 'id'});
User2Board.belongsTo(Board, {foreignKey: 'idBoard', targetKey: 'id'});

module.exports = User2Board;
