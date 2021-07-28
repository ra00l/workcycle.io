const router = require('express').Router();

const email = require('../email');
const logger = require('../logger');

const ObjectStatus = require('../common/status-enum');

const utilities = require('../utilities');

router.get('/status', function (req, res) {
  res.send('Hello world!');
});

router.get('/email', utilities.promiseCatch(async function (req, res) {
  if (!req.query.to) {
    return res.send('No to address specified!');
  }
  try {
    await email.send(req.query.to, 'test', {date: new Date()});
    res.send('Sent successfully!');
  }
  catch (err) {
    res.send('Error sending!' + JSON.stringify(err));
    logger.error('Error sending email', err);
  }
}));


router.post('/clean-deleted', utilities.promiseCatch(async function(req, res) {

  if(!req.locals.user) { //todo: make sure admin also?
    return errorHelper.notFound(res);
  }

  await db.raw.query(`
delete from board where status=${ObjectStatus.Deleted};
delete from user2board where "idBoard" in (select id from board where status=${ObjectStatus.Deleted});

delete from "workItemComment" where "idWorkItem" in (select id from "workItem" where status=${ObjectStatus.Deleted});
delete from "workItemFile" where "idWorkItem" in (select id from "workItem" where status=${ObjectStatus.Deleted});
delete from "workItem" where status=${ObjectStatus.Deleted};

   `, {
    replacements: {idWk: board.idWorkspace},
    type: sequelize.QueryTypes.UPDATE
  });

  res.send({'status': 'ok'});
}));

module.exports = router;
