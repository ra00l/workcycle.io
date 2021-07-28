const Sequelize = require('sequelize');

Sequelize.Promise.config({
  longStackTraces: true
});

const config = require('../../config').getCurrent();

const logger = require('../logger');

require('pg').defaults.parseInt8 = true; //return BIGINT as integer, not string

const sequelize = new Sequelize(config.connectionString,
  {
    pool: {
      max: 5,
      min: 0,
      idle: 20000,
      acquire: 20000
    },
    operatorsAliases: false,
    logging: false,
    dialect: 'postgresql',
    define: {
      freezeTableName: true //prevent sequelize from pluralizing table names
    }
  }
);

module.exports = sequelize;
