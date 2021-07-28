'use strict';

const db = require('./db/models');
const ObjectStatus = require('./common/status-enum');
const logger = require('./logger');

async function getBoardRight(idBoard, idUser) {
  let res = await db.select('select b."idWorkspace", b."boardAccessType",u2b."role" from board b left join user2board u2b on u2b."idBoard"=b.id and u2b."idUser"=:idUser where b.id=:idBoard', {
    idUser: idUser,
    idBoard: idBoard
  });

  if (res.length !== 1) return '';

  const row = res[0];
  if (row.boardAccessType !== 0) return row.role;

  return getWorkspaceRight(row.idWorkspace, idUser);
}

async function getWorkspaceRight(idWorkspace, idUser) {
  let res = await db.select('select u2w."role" from user2workspace u2w where u2w."idWorkspace"=:idWorkspace and u2w."idUser"=:idUser', {
    idUser: idUser,
    idWorkspace: idWorkspace
  });

  if (res.length !== 1) return '';

  const row = res[0];

  return row.role;
}

module.exports = {
  getBoardRight: getBoardRight,
  getWorkspaceRight: getWorkspaceRight,

  canReadWorkspace: async function (idWorkspace, idUser) {
    const right = await getWorkspaceRight(idWorkspace, idUser);
    const hasRight = right === 'rw' || right === 'r' || right === 'a';
    if (!hasRight) {
      logger.warn(`user ${idUser} requested READ on workspace ${idWorkspace} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  canModifyWorkspace: async function (idWorkspace, idUser) {
    const right = await getWorkspaceRight(idWorkspace, idUser);
    const hasRight = right === 'a' || right === 'rw';
    if (!hasRight) {
      logger.warn(`user ${idUser} requested WRITE on workspace ${idWorkspace} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  canAddBoard: async function (idWorkspace, idUser) {
    let right = await getWorkspaceRight(idWorkspace, idUser);

    const hasRight = right === 'a';
    if (!hasRight) {
      logger.warn(`user ${idUser} requested ADD BOARD on workspace ${idWorkspace} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  canModifyBoard: async function (idBoard, idUser) {
    const right = await getBoardRight(idBoard, idUser);
    const hasRight = right === 'a';

    if (!hasRight) {
      logger.warn(`user ${idUser} requested CHANGE BOARD on board ${idBoard} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  canWriteBoard: async function (idBoard, idUser) {
    const right = await getBoardRight(idBoard, idUser);
    const hasRight = right === 'a' || right === 'rw';

    if (!hasRight) {
      logger.warn(`user ${idUser} requested CHANGE BOARD on board ${idBoard} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  canReadBoard: async function (idBoard, idUser) {
    const right = await getBoardRight(idBoard, idUser);
    const hasRight = right === 'rw' || right === 'r' || right === 'a';

    if (!hasRight) {
      logger.warn(`user ${idUser} requested READ BOARD on board ${idBoard} but did not have rights (${right})!`);
    }
    return hasRight;
  },
  getBoardIdList: async function (idWorkspace, idUser) {
    let res = await db.select(`select b.id from board b where "idWorkspace"=:idWorkspace and status=${ObjectStatus.Active} and ("boardAccessType"=0 
      or (select u2b."role" from user2board u2b where u2b."idUser"=:idUser and u2b."idBoard"=b.id limit 1) = any(array['r', 'rw', 'a']))`, {
      idWorkspace: idWorkspace,
      idUser: idUser
    });

    return res.map(b => b.id);
  }
};
