
const config = require('../config').getCurrent();
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const sharp = require('sharp');

const logger = require('./logger');

const AWS = require('aws-sdk');
AWS.config.update({
  accessKeyId: 'aws key',
  secretAccessKey: 'aws secret' //TODO: these should be in config
});
const S3 = new AWS.S3();


const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './files');
  },
  filename: function (req, file, callback) {
    //console.log(file);
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

const allowedImgExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
function imageFileFilter (req, file, callback) {
  let ext = path.extname(file.originalname).toLowerCase();

  if (allowedImgExtensions.indexOf(ext) === -1) {
    return callback(new Error('Only images are allowed'), null);
  }
  callback(null, true);
}

const allowedGenericExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.xls', '.xlsx', '.doc', '.docx', '.txt', '.pdf', '.svg'];
function genericFileFilter (req, file, callback) {
  let ext = path.extname(file.originalname).toLowerCase();

  if (allowedGenericExtensions.indexOf(ext) === -1) {
    return callback(new Error(`Extension ${ext} not allowed. Only the following files are allowed: ${allowedGenericExtensions.join(', ')}`), null);
  }
  callback(null, true);
}

const thumbSize = 150;

function awsUploadFile(filePath, mimeType, basePath) {
  //configuring parameters
  return new Promise((resolve, reject) => {
    const awsParams = {
      Bucket: 'workcycle-files',
      Body : fs.createReadStream(filePath),
      Key : `${basePath}/${path.basename(filePath)}`,
      ACL: 'public-read',
      ContentType: mimeType
    };

    S3.upload(awsParams, function (err, data) {
      //handle error
      if (err) {
        logger.error('error uploading to aws: ' + err);
        return reject(err);
      }

      //success
      if (data) {
        logger.info("Uploaded profile image at: ", data.Location);
      }
      resolve(data.Location);
    });
  });
}

async function uploadMultiple(req, res, uploadKey) {
  let upload = multer({
    storage: storage,
    fileFilter: genericFileFilter
  }).array('file');

  return new Promise((resolve, reject) => {
    upload(req, res, async function (err) {

      if(err) {
        logger.error('error uploading files: ', err);
        return reject(err);
      }

      if(!req.files) return resolve(); // user didn't upload a file

      const resultArr = [];
      for(let userFile of req.files) {
        console.log('file', userFile);
        const result = await awsUploadFile(userFile.path, userFile.mimetype, uploadKey);
        resultArr.push({ url: result, mimeType: userFile.mimetype, name: userFile.originalname});

        await fs.unlink(userFile.path, errDelete);
      }

      return resolve(resultArr);
    });
  });

  function errDelete(err) {
    if (err) logger.error('Cannot remove temp file: ', err);
  }
}

async function uploadAndResizeImage(req, res) {
  let upload = multer({
    storage: storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: '15MB' }
  }).single('file');

  return new Promise((resolve, reject) => {
    upload(req, res, async function (err) {
      if(err) return reject(err);

      let userFile = req.file;

      if(!userFile) return resolve(); // user didn't upload a file

      //time to do resize!
      const thumbFileName = `${Date.now()}_${thumbSize}_${userFile.filename}`;
      await sharp(userFile.path)
        .resize(thumbSize, thumbSize)
        .toFile('./files/' + thumbFileName);
      sharp.cache(false); //disable file cache!

      const result = await awsUploadFile('./files/' + thumbFileName, userFile.mimetype, 'profile-image');

      function errDelete(err) {
        if(err) logger.error('Cannot remove thumb file: ', err);
      }
        await fs.unlink(userFile.path, errDelete);
        await fs.unlink('files/' + thumbFileName,  errDelete);

      return resolve(result);
    });
  });
}

module.exports = {
  //fileUpload: fileUpload,
  uploadAndResizeImage: uploadAndResizeImage,
  uploadMultiple: uploadMultiple
};
