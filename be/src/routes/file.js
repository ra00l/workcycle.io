'use strict';

const router = require('express').Router({mergeParams: true});

const db = require('../db/models');
const sequelize = require('../db');

const slugify = require('slugify');
const utilities = require('../utilities');

const logger = require('../logger');
const emailTransport = require('../email');
const errorHelper = require('../error-helper');

router.get('/:fileName', utilities.promiseCatch(async function (req, res) {
    const fileName = req.params.fileName;
    return res.sendFile('files/' + fileName, { root: './' });
}));


module.exports = router;
