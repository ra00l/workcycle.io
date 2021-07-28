const Sequelize = require('sequelize');
const db = require('../index');

const Invitation = db.define('invitation', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: Sequelize.STRING
  },
  role: {
    type: Sequelize.STRING
  },
  confirmKey: Sequelize.STRING,
  idWorkspace: {
    type: Sequelize.BIGINT
  },
  createdBy: Sequelize.BIGINT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});

module.exports = Invitation;
