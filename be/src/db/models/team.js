const Sequelize = require('sequelize');
const db = require('../index');

const Client = require('./client');

const Team = db.define('team', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  idClient: {
    type: Sequelize.BIGINT
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

Team.belongsTo(Client, {foreignKey: 'idClient', targetKey: 'id'});

module.exports = Team;
