const Sequelize = require('sequelize');
const db = require('../index');

const Client = require('./client');
const Workspace = require('./workspace');

const BoardTemplate = db.define('boardTemplate', {
  id: {
    type: Sequelize.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: Sequelize.STRING
  },
  description: {
    type: Sequelize.TEXT
  },
  data: {
    type: Sequelize.JSON
  },
  items: {
    type: Sequelize.JSON
  },
  idClient: {
    type: Sequelize.BIGINT
  },
  idWorkspace: {
    type: Sequelize.BIGINT
  },
  templateType: {
    type: Sequelize.INTEGER
  },
  status: {
    type: Sequelize.INTEGER,
    allowNull: false
  },
  idParent: Sequelize.BIGINT,
  previewImage: Sequelize.TEXT,
  createdAt: Sequelize.DATE,
  updatedAt: Sequelize.DATE
}, {timestamps: true});


BoardTemplate.belongsTo(BoardTemplate, {foreignKey: 'idParent', targetKey: 'id'});
BoardTemplate.belongsTo(Client, {foreignKey: 'idClient', targetKey: 'id'});
BoardTemplate.belongsTo(Workspace, {foreignKey: 'idWorkspace', targetKey: 'id'});

module.exports = BoardTemplate;
