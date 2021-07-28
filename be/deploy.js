const fs = require('fs');
const os = require('os');
const path = require('path');
const NodeSsh = require('node-ssh');
const ssh = new NodeSsh();

const dotConfig = {
  'hostname': {
    pvk: 'private-key'
  }
};
const deployTypeConfig = {
  staging: {
    host: 'hostname',
    user: 'user',
    site: 'sitename',
    remoteRoot: '/path/to/dir'
  },
  production: {
  
  }
};

const args = process.argv.slice(2);
if(!args[0]) {
  console.error('Please specify the type of development: staging or production!');
  return;
}
const typeOfDeploy = args[0];
const config = deployTypeConfig[typeOfDeploy];

const host = os.hostname().toLowerCase();
const currDir = process.cwd();
console.log('host: ', host, ', current dir: ', currDir, 'deploy type: ', typeOfDeploy);

function getFileList(fileArr) {
  const outArr = [];
  for (let fileName of fileArr) {
    outArr.push({local: path.join(currDir, fileName), remote: path.join(config.remoteRoot, fileName).replace(/\\/g, '/')});
  }
  console.log(outArr);
  return outArr;
}


deploy();

async function deploy() {

  const sshConn = await ssh.connect({
    host: config.host,
    username: config.user,
    privateKey: dotConfig[host].pvk
  });

  console.log('-------------- Copying files ---------------------');
  const filesToCopy = getFileList(['index.js', 'config.js', 'package.json', 'package-lock.json']);
  for(let f of filesToCopy) {
    let res = await sshConn.putFile(f.local, f.remote);
    console.log('file copy ', f.local, res);
  }
  console.log('Done copying files!');
  console.log('--------------------------------------------------------');

  console.log('-------------- Copying src folder ---------------------');
  let srcCopyErr = false;
  const srcCopyRes = await sshConn.putDirectory(path.join(currDir, 'src'), path.join(config.remoteRoot, 'src'), {
    recursive: true,
    concurrency: 10,
    tick: function (localPath, remotePath, error) {
      if(error) {
        srcCopyErr = true;
        console.error('Failed to copy ', localPath, error);
      }
      else {
        console.log('Copied ', localPath);
      }
    }
  });
  if(srcCopyErr) return console.error('Error copying src...', srcCopyRes);
  console.log('Done copying src', srcCopyRes);
  console.log('--------------------------------------------------------');


  sshConn.dispose();
}


