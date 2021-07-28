'use strict';
const sequelize = require('../index');

async function querySelect(query, replacements) {

  return await sequelize.query(query, {
    replacements: replacements,
    raw: true,
    type: sequelize.QueryTypes.SELECT
  });
}

module.exports = {
  raw: sequelize,

  select: querySelect,

  user: require('./user'),
  client: require('./client'),
  workspace: require('./workspace'),
  team: require('./team'),
  boardTemplate: require('./board-template'),
  board: require('./board'),
  nest: require('./nest'),
  workItem: require('./work-item'),
  workItemComment: require('./work-item-comment'),
  workItemFile: require('./work-item-file'),
  user2workspace: require('./user2workspace'),
  user2board: require('./user2board'),
  boardFolder: require('./board-folder'),
  workItemAction: require('./work-item-action'),
  invitation: require('./invitation'),
  userLogin: require('./user-login'),

  syncAll: async function () {

    let opts;
    //if(true) opts = { force: true }; //delete & recreate tables!

    await this.client.sync(opts);
    await this.workspace.sync(opts);
    await this.user.sync(opts);
    await this.team.sync(opts);
    await this.user2workspace.sync(opts);

    await this.boardTemplate.sync(opts);
    await this.board.sync(opts);
    await this.nest.sync(opts);
    await this.workItem.sync(opts);
    await this.workItemComment.sync(opts);
    await this.workItemFile.sync(opts);

    await this.user2board.sync(opts);

    await this.boardFolder.sync(opts);

    await this.workItemAction.sync(opts);
    await this.invitation.sync(opts);
    await this.userLogin.sync(opts);
  }
};
