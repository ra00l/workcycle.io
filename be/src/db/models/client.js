const Sequelize = require('sequelize');
const db = require('../index');

const Client = db.define('client', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  domain: {
    type: Sequelize.STRING
  },
  teamSize: {
    type: Sequelize.INTEGER
  },
  plan: {
    type: Sequelize.STRING
  },
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

module.exports = Client;
