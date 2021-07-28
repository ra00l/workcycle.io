const Umzug = require('umzug');
const db = require('../index');

const logger = require('../../logger');

function migrate () {
  return db.authenticate()
    .then(function () {
      require('../models');
      return db.sync();
    }).then(function () {
      const umzug = new Umzug({
        storage: 'sequelize',
        storageOptions: {
          sequelize: db
        },
        migrations: {
          path: __dirname,
          pattern: /^\d+[\w-]+\.js$/,
          params: [db.getQueryInterface(), db.constructor]
        }
      });

      return umzug.pending().then(migrations => {
        if (migrations.length === 0) {
          logger.debug(`No migrations to run. application starting normally`);
          return false;
        }

        logger.info(`${migrations.length}  migration${migrations.length > 1 ? 's' : ''} pending -- running them sequentially`);

        return umzug.up().then(function () {
          logger.info(`${migrations.length} migration${migrations.length > 1 ? 's' : ''} applied -- application ready to use`);
        });
      });
    });
}

module.exports = migrate;
