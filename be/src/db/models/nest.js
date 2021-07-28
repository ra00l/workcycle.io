const Sequelize = require('sequelize');
const db = require('../index');

const Board = require('./board');

const Nest = db.define('nest', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  idBoard: {
    type: Sequelize.BIGINT
  },
  color: {
    type: Sequelize.STRING
  },
  order: {
    type: Sequelize.INTEGER
  },
  status: {
    type: Sequelize.INTEGER
  },
  createdBy: Sequelize.BIGINT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});


Nest.belongsTo(Board, {foreignKey: 'idBoard', targetKey: 'id'});

module.exports = Nest;
