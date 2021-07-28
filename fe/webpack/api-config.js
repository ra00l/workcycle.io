const os = require('os');

const host = os.hostname().toLowerCase();

const dotConfig = {
  'raul-asus': {
    apiBase: 'http://localhost:3456/api',
  },
  'raul-pc': {
    apiBase: 'http://localhost:3456/api',
  },
  'lazars-mbp': {
    apiBase: 'https://ec2-34-244-21-147.eu-west-1.compute.amazonaws.com/api',
  },
  'lazars-macbook-pro.local': {
    apiBase: 'https://ec2-34-244-21-147.eu-west-1.compute.amazonaws.com/api',
  },
};

function getConfig(host) {
  return dotConfig[host] || {
    apiBase: '/api',
  };
}

module.exports = getConfig(host);
