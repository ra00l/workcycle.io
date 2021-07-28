const fs = require('fs');
const os = require('os');
const path = require('path');
const exec = require('child_process').exec;
const NodeSsh = require('node-ssh');
const ssh = new NodeSsh();

const dotConfig = {
  '[your host name]': {
    pvk: 'path/to/private/key',
  }
};

const deployTypeConfig = {
  staging: {
    host: 'staging-hostname',
    user: 'remote-user',
    site: 'remote-site-name',
    remoteRoot: 'remote/root/path',
  },
  production: {
  },
};

const args = process.argv.slice(2);

if (!args[0]) {
  console.error('Please specify the type of development: staging or production!');
  return;
}

const typeOfDeploy = args[0];
const config = deployTypeConfig[typeOfDeploy];

const host = os.hostname().toLowerCase();
const currDir = process.cwd();

console.log('+-------------- Run deploy.js ---------------------');
console.log('|-> host: ', host);
console.log('|-> current directory: ', currDir);
console.log('|--------------------------------------------------');
console.log('|-> Deploy to ', typeOfDeploy.toUpperCase());
console.log('+---------------------------------------------------');

function getFileList(fileArr) {
  const outArr = [];
  for (const fileName of fileArr) {
    outArr.push({local: path.join(currDir, fileName), remote: path.join(config.remoteRoot, fileName)});
  }

  return outArr;
}

async function deploy() {
  console.log('-------------- Building files ---------------------');
  const res = await execPromise('yarn build');
  console.log('-------------- Build successfull, starting deploy ---------------------');

  const sshConn = await ssh.connect({
    host: config.host,
    username: config.user,
    privateKey: dotConfig[host].pvk,
  });

  console.log('-------------- Copying files ---------------------');

  let srcCopyErr = false;
  const srcCopyRes = await sshConn.putDirectory(path.join(currDir, 'build'), path.join(config.remoteRoot, ''), {
    recursive: true,
    concurrency: 10,
    tick: function (localPath, remotePath, error) {
      if (error) {
        srcCopyErr = true;
        console.error('Failed to copy ', localPath, error);
      } else {
        console.log('-> Copied file: ', localPath);
      }
    },
  });

  if (srcCopyErr) {
    return console.error('Error copying build filed...', srcCopyRes);
  }
  
  sshConn.dispose();

  console.log('+---------------------------------------+');
  console.log('|------------- Done --------------------|');
  console.log('+---------------------------------------+');
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, {maxBuffer: 1024 * 500000}, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      resolve(stdout.trim());
    });
  });
}

deploy();
