const emailConfig = {
  APIKEY: 'sendgrid/api/key',
  from: 'hello@workcycle.io',

};

const api = {
  TrelloKey: 'trello/api/key',
  GitHubClientId: 'github/client/id',
  GitHubClientSecret: 'github/client/secret'
};

const config = {
  'DEVELOPMENT': {
    salt: 'salt/for/hashing',
    connectionString: '/postgres/db/connection',
    secret: 'shhhh',
    email: emailConfig,
    noSendEmail: true,
    emailVars: {
      appHost: 'http://localhost:3000'
    },
    api: api,
    templateWorkspaceId: 4,
    forestSecret: 'forect-secret',
    forestAuthSecret: 'forest-auth-secret'
  },
  'PRODUCTION': {
    salt: 'x',
    connectionString: 'x',
    secret: 'x',
    email: emailConfig,
    emailVars: {
      appHost: 'https://demo.app.host'
    },
    api: api,
    templateWorkspaceId: 4,
    sentryDsn: 'sentry/error/logging',
  }
};

module.exports = {
  getCurrent: function () {
    return config[process.env.NODE_ENV || 'DEVELOPMENT'];
  }
};

