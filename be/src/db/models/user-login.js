const Sequelize = require('sequelize');
const db = require('../index');

const User = require('./user');

const UserLogin = db.define('userLogin', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  idUser: {
    type: Sequelize.BIGINT
  },
  ip: {
    type: Sequelize.STRING
  },
  // Timestamps
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

UserLogin.belongsTo(User, {foreignKey: 'idUser', targetKey: 'id'});

module.exports = UserLogin;
